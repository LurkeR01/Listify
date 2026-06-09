using Listify.Application.Common.Interfaces;
using Listify.Application.Common.Interfaces.Category;
using Listify.Application.DTOs;
using Listify.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Listify.Application.Services;

public class ListingQueryService
{
    private readonly IAppDbContext _appDbContext;
    private readonly ICategoryRepository _categoryRepository;

    public ListingQueryService(
        IAppDbContext appDbContext,
        ICategoryRepository categoryRepository)
    {
        _appDbContext = appDbContext;
        _categoryRepository = categoryRepository;
    }

    public async Task<PagedResult<ResponseListingPreviewDto>> HandleQuery(
        GetListingsQuery request,
        CancellationToken token)
    {
        var query = _appDbContext.Listings.AsNoTracking();

        if (request.CategoryId.HasValue)
        {
            var categoryIds = await _categoryRepository.GetCategoryIdsAsync(request.CategoryId.Value);
            query = query.Where(l => categoryIds.Contains(l.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
            query = query.Where(l => EF.Functions.FreeText(l.Title, request.SearchText));

        if (request.MinPrice.HasValue)
            query = query.Where(l => l.Price >= request.MinPrice.Value);

        if (request.MaxPrice.HasValue)
            query = query.Where(l => l.Price <= request.MaxPrice.Value);

        if (request.AttributeFilters is { Count: > 0 })
        {
            var groups = request.AttributeFilters.GroupBy(v => v.CategoryAttributeId);

            foreach (var group in groups)
            {
                var ids = group.Select(v => v.CategoryAttributeValueId).ToList();

                query = query.Where(l =>
                    l.ListingAttributeValues.Any(v =>
                        ids.Contains(v.CategoryAttributeValueId)));
            }
        }

        if (request.LocationRef != null)
        {
            query = query.Where(l => l.Location.Ref == request.LocationRef);
        }

        query = query.Where(l => l.Status == ListingStatus.Published);

        var pagination = request.Pagination ?? new PaginationParams();
        var page = Math.Max(pagination.Page, 1);
        var pageSize = Math.Clamp(pagination.PageSize, 1, 100);
        var totalCount = await query.CountAsync(token);

        var items = await query
            .OrderByDescending(l => l.CreatedOn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new ResponseListingPreviewDto
            {
                Id = l.Id,
                Title = l.Title,
                Price = l.Price,
                Location = new LocationDto
                {
                    Name = l.Location.Name,
                    Ref = l.Location.Ref,
                    Area = l.Location.Area,
                },
                ImageUrl = l.ListingImages
                    .Where(i => i.Order == 0)
                    .Select(i => i.Url)
                    .FirstOrDefault()
            })
            .ToListAsync(token);

        return new PagedResult<ResponseListingPreviewDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}

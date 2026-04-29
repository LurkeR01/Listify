using Listify.Application.Common.Interfaces;
using Listify.Application.Common.Interfaces.Category;
using Listify.Application.DTOs;
using Listify.Application.Exceptions;
using Listify.Application.Interfaces.Listing;
using Listify.Domain;
using Listify.Domain.DTOs;
using Listify.Domain.Entities;
using Listify.Domain.Entities.Listing;
using Listify.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Listify.Application.Services;

public class ListingService
{
    private readonly IListingRepository _listingRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IAppDbContext _appDbContext;

    public ListingService(
        IListingRepository listingRepository,
        ICategoryRepository categoryRepository,
        IAppDbContext appDbContext)
    {
        _listingRepository = listingRepository;
        _categoryRepository = categoryRepository;
        _appDbContext = appDbContext;
    }

    public async Task<Listing> GetListingAsync(Guid listingId, CancellationToken token)
    {
        return await _listingRepository.GetListingAsync(listingId, token) ?? throw new NotFoundException("Listing not found");
    }

    public async Task CreateListingAsync(CreateListingCommand command)
    {
        int validCount = await _categoryRepository.CountValidAttributesAsync(command);
        if (validCount != command.ListingAttributeDtos.Count()) 
            throw new Exception("Invalid attribute");
        
        var location = Location.Create(
            command.Location.Name, 
            command.Location.Ref, 
            command.Location.Area);
        
        var newListing = Listing.Create(
            command.Title,
            command.Description,
            command.Price,
            location,
            command.PublishedByUserId,
            command.CategoryId
        );

        foreach (var attribute in command.ListingAttributeDtos)
        {
            newListing.AddAttribute(attribute.CategoryAttributeValueId);
        }

        foreach (var image in command.ListingImageDtos)
        {
            newListing.AddImage(image.Url, image.Order, image.PublicId);
        }

        await _listingRepository.CreateListingAsync(newListing);
    }

    public async Task UpdateListingAsync(UpdateListingCommand command, Guid userId, CancellationToken token)
    {
        var listing = await _listingRepository.GetListingAsync(command.Id, token);
        if (listing == null)
            throw new NotFoundException("Listing not found");
        
        if (listing.PublishedByUserId != userId)
            throw new UnauthorizedAccessException();

        listing.Update(
            command.Title,
            command.Description,
            command.Price,
            command.CategoryId
        );
        
        listing.Location.Update(command.Location.Name, command.Location.Ref, command.Location.Area);
        
        listing.UpdateAttributes(command.ListingAttributeDtos
            .Select(a => a.CategoryAttributeValueId)
            .ToList());
        
        listing.UpdateImages(command.ListingImageDtos
            .Select(i => new ListingImageDto
            {
                Id = i.Id,
                Url = i.Url,
                Order = i.Order,
                PublicId = i.PublicId,
            }).ToList());
        
        await _listingRepository.SaveChangesAsync(token);
    }

    public async Task DeleteListingAsync(Guid listingId, Guid userId, CancellationToken token)
    {
        var listing = await _listingRepository.GetListingAsNoTrackingAsync(listingId, token);
        if (listing == null)
            throw new NotFoundException("Listing not found");
        
        if (listing.PublishedByUserId != userId)
            throw new UnauthorizedAccessException();
        
        await _listingRepository.DeleteListingAsync(listingId, token);
    }

    public async Task<List<ResponseListingPreviewDto>> HandleQuery(
        GetListingsQuery request,
        CancellationToken token
    )
    {
        var query = _appDbContext.Listings.AsQueryable();

        if (request.CategoryId.HasValue)
        {
            var categoryIds = await _categoryRepository.GetCategoryIdsAsync(request.CategoryId.Value);
            query = query
                .AsNoTracking()
                .Where(l => categoryIds.Contains(l.CategoryId));
        }
        
        if (!string.IsNullOrWhiteSpace(request.SearchText))
            query = query.Where(l => EF.Functions.FreeText(l.Title, request.SearchText));
        
        if (request.MinPrice.HasValue)
            query = query.Where(l => l.Price >= request.MinPrice.Value);
        
        if (request.MaxPrice.HasValue)
            query = query.Where(l => l.Price <= request.MaxPrice.Value);

        if (request.AttributeFilters is { Count: > 0 })
        {
            var groups = 
                request.AttributeFilters.GroupBy(v => v.CategoryAttributeId);

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
        
        return await query.Select(l => new ResponseListingPreviewDto
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
    }

    public async Task<List<ResponseListingPreviewDto>> GetForUser(Guid userId, CancellationToken token)
    {
        return await _appDbContext.Listings.
            AsNoTracking().
            Where(l => l.PublishedByUserId == userId).
            Select(l => new ResponseListingPreviewDto
            {
                Id = l.Id,
                Title = l.Title,
                Price = l.Price,
                CategoryId = l.CategoryId,
                Location = new LocationDto
                {
                    Name = l.Location.Name,
                    Ref = l.Location.Ref,
                    Area = l.Location.Area,
                },
                Status = l.Status,
            
                ImageUrl = l.ListingImages
                    .Where(i => i.Order == 0)
                    .Select(i => i.Url)
                    .FirstOrDefault()
            }).ToListAsync(token);
    }

    public async Task UpdateStatusAsync(
        Guid listingId,
        Guid userId, 
        ListingStatus status, 
        CancellationToken token)
    {
        var listing = await _listingRepository.GetListingAsNoTrackingAsync(listingId, token);
        if (listing == null)
            throw new NotFoundException("Listing not found");
        
        if (listing.PublishedByUserId != userId)
            throw new UnauthorizedAccessException();
        
        await _listingRepository.UpdateStatusAsync(listingId, status, token);
    } 
}

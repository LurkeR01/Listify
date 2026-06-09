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
            throw new ValidationException("Invalid attribute");
        
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
            throw new ForbiddenException("You are not allowed to update this listing");

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
            throw new ForbiddenException("You are not allowed to delete this listing");
        
        await _listingRepository.DeleteListingAsync(listingId, token);
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
                PublishedAt = l.CreatedOn,
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
            throw new ForbiddenException("You are not allowed to update this listing");
        
        await _listingRepository.UpdateStatusAsync(listingId, status, token);
    } 
}

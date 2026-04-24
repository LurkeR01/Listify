using Listify.Api.DTOs.Category;
using Listify.Api.DTOs.Listing;
using Listify.Api.DTOs.User;
using Listify.Domain;

namespace Listify.Api.Mappers;

public static class ListingMapping
{
    public static ResponseListingDto ToResponse(this Listing l)
    {
        return new ResponseListingDto
        {
            Id = l.Id,
            Title = l.Title,
            Description = l.Description,
            Price = l.Price,
            Location = l.Location,
            CreatedOn = l.CreatedOn,
            PublishedByUser = new ResponseUserDto
            {
                Id = l.PublishedByUser.Id,
                FirstName = l.PublishedByUser.FirstName,
                LastName = l.PublishedByUser.LastName,
                Email = l.PublishedByUser.Email,
                RegisteredAt = l.PublishedByUser.RegisteredAt,
                PhoneNumber = l.PublishedByUser.PhoneNumber,
                AvatarUrl = l.PublishedByUser.AvatarUrl,
                AvatarPublicId = l.PublishedByUser.AvatarPublicId,
            },
            Category = new ResponseCategoryDto
            {
                Id = l.Category.Id,
                Name = l.Category.Name,
            },
            
            Attributes = l.ListingAttributeValues.Select(lav => 
                new ResponseListingAttributeValueDto
                {
                    Id = lav.Id,
                    CategoryAttributeName = lav.CategoryAttributeValue.CategoryAttribute.Name,
                    CategoryAttributeValue = lav.CategoryAttributeValue.Value,
                }).ToList(),
            
            ListingImages = l.ListingImages.Select(i =>
                new ResponseListingImageDto
                {
                    Id = i.Id,
                    Url = i.Url,
                    Order = i.Order,
                    PublicId = i.PublicId,
                }).ToList()
        };
    }
}
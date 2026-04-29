using Listify.Api.DTOs.Category;
using Listify.Api.DTOs.User;
using Listify.Domain;
using Listify.Domain.Entities;

namespace Listify.Api.DTOs.Listing;

public class ResponseListingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public Location Location { get; set; }
    public ResponseUserDto PublishedByUser { get; set; }
    public DateTime CreatedOn { get; set; }
    public ResponseCategoryDto Category { get; set; }
    public List<ResponseListingAttributeValueDto> Attributes { get; set; }
    public List<ResponseListingImageDto> ListingImages { get; set; }
}
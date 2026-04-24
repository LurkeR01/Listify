using Listify.Application.DTOs;
using Listify.Domain;

namespace Listify.Api.DTOs.Listing;

public class CreateListingDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public LocationDto Location { get; set; }
    public int CategoryId { get; set; }
    
    public IEnumerable<ListingAttributeDto> ListingAttributeDtos { get; set; } = new List<ListingAttributeDto>();
    public IEnumerable<ListingImageDto> ListingImageDtos { get; set; } = new List<ListingImageDto>();
}
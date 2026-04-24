namespace Listify.Application.DTOs;

public class UpdateListingCommand
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public LocationDto Location { get; set; }
    public int CategoryId { get; set; }
    public IEnumerable<ListingAttributeInput> ListingAttributeDtos { get; set; }
    public IEnumerable<ListingImageInput> ListingImageDtos { get; set; }
}
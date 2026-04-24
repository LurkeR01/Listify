namespace Listify.Api.DTOs.Listing;

public class ResponseListingImageDto
{
    public Guid Id { get; set; }
    public string Url { get; set; }
    public int Order { get; set; }
    public string PublicId { get; set; }
}
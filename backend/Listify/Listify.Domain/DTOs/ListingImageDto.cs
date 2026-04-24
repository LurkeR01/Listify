namespace Listify.Domain.DTOs;

public class ListingImageDto
{
    public Guid? Id { get; set; }
    public string Url { get; set; }
    public int Order { get; set; }
    public string PublicId { get; set; }
}
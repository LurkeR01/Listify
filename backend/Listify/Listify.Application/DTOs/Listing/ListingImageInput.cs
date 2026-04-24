namespace Listify.Application.DTOs;

public class ListingImageInput
{
    public Guid? Id {  get; set; }
    public string Url  { get; set; }
    public int Order  { get; set; }
    public string? PublicId { get; set; }
}
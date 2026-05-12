namespace Listify.Api.DTOs.User;

public class ResponseUserRatingDto
{
    public Guid Id { get; set; }
    public ShortResponseUserDto FromUser { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid ListingId { get; set; }
}
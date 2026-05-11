namespace Listify.Api.DTOs.User;

public class UserRatingDto
{
    public Guid RatedUserId { get; set; }
    public Guid ListingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
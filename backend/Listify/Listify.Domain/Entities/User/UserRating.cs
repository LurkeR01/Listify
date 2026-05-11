namespace Listify.Domain.Entities.User;

public class UserRating
{
    private UserRating() {}
    
    public Guid Id { get; private set; }
    public Guid FromUserId { get; private set; }
    public User FromUser { get; private set; }
    public Guid ToUserId { get; private set; }
    public User ToUser { get; private set; }
    public Guid ListingId { get; private set; }
    public Listing.Listing Listing { get; private set; }
    public int Rating { get; private set; }
    public string? Comment  { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public static UserRating Create(
        int rating, 
        string? comment,
        Guid fromUserId,
        Guid toUserId,
        Guid listingId)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5");

        return new UserRating
        {
            Rating = rating,
            Comment = comment,
            FromUserId = fromUserId,
            ToUserId = toUserId,
            ListingId = listingId,
            CreatedAt = DateTime.Now
        };
    }
}
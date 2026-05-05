namespace Listify.Domain.Entities.Chat;

public class Conversation
{
    private Conversation() {}

    private readonly List<Message> _messages = new();

    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ListingId { get; private set; }
    public Listing.Listing Listing { get; private set; }

    public Guid BuyerId { get; private set; }
    public User.User Buyer { get; private set; }

    public Guid SellerId { get; private set; }
    public User.User Seller { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public IReadOnlyCollection<Message> Messages => _messages;

    public static Conversation Create(Guid listingId, Guid buyerId, Guid sellerId)
    {
        if (buyerId == sellerId)
            throw new ArgumentException("Buyer and seller cannot be the same user");

        return new Conversation
        {
            ListingId = listingId,
            BuyerId = buyerId,
            SellerId = sellerId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddMessage(Message message)
    {
        if (message.SenderId != BuyerId && message.SenderId != SellerId)
            throw new Exception("User is not part of conversation");

        _messages.Add(message);
    }
}

namespace Listify.Domain.Entities.Chat;

public class Conversation
{
    private Conversation() {}

    private readonly List<ConversationParticipant> _participants = new();
    private readonly List<Message> _messages = new();

    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid? ListingId { get; private set; }
    public Listing? Listing { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public IReadOnlyCollection<ConversationParticipant> Participants => _participants;
    public IReadOnlyCollection<Message> Messages => _messages;

    public static Conversation Create(Guid? listingId)
    {
        return new Conversation
        {
            ListingId = listingId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddParticipant(Guid userId)
    {
        if (_participants.Any(p => p.UserId == userId))
            return;

        _participants.Add(ConversationParticipant.Create(Id, userId));
    }

    public void AddMessage(Guid senderId, string text)
    {
        if (!_participants.Any(p => p.UserId == senderId))
            throw new Exception("User is not part of conversation");

        _messages.Add(Message.Create(Id, senderId, text));
    }
}
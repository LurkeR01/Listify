namespace Listify.Domain.Entities.Chat;

public class ConversationParticipant
{
    private ConversationParticipant() {}

    public int Id { get; private set; }

    public Guid ConversationId { get; private set; }
    public Conversation Conversation { get; private set; }

    public Guid UserId { get; private set; }
    public User User { get; private set; }

    public DateTime JoinedAt { get; private set; }

    public static ConversationParticipant Create(Guid conversationId, Guid userId)
    {
        return new ConversationParticipant
        {
            ConversationId = conversationId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };
    }
}
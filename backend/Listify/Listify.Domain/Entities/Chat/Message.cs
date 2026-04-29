namespace Listify.Domain.Entities.Chat;

public class Message
{
    private Message() {}

    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ConversationId { get; private set; }
    public Conversation Conversation { get; private set; }

    public Guid SenderId { get; private set; }
    public User.User Sender { get; private set; }

    public string Text { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public static Message Create(Guid conversationId, Guid senderId, string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Message cannot be empty");

        return new Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Text = text,
            CreatedAt = DateTime.UtcNow
        };
    }
}
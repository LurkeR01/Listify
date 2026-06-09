namespace Listify.Api.DTOs.Chat;

public class SendMessageRequestDto
{
    public string ConversationId { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}

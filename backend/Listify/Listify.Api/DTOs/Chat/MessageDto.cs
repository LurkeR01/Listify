namespace Listify.Api.DTOs.User;

public class MessageDto
{
    public Guid Id { get; set; }
    public string Text { get; set; }
    public ShortResponseUserDto Sender { get; set; }
    public DateTime CreatedAt { get; set; }
}
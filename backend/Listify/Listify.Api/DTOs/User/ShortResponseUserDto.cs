namespace Listify.Api.DTOs.User;

public class ShortResponseUserDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarPublicId { get; set; }
}
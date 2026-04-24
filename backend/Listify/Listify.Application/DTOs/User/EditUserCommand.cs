using Listify.Domain;

namespace Listify.Application.DTOs.User;

public class EditUserCommand
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public LocationDto? Location { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarPublicId { get; set; }
}
using Listify.Application.DTOs;

namespace Listify.Api.DTOs.User;

public class EditUserRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public LocationDto? Location { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarPublicId { get; set; }
}
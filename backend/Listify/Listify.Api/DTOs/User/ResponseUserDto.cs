using Listify.Api.DTOs.Listing;
using Listify.Domain;

namespace Listify.Api.DTOs.User;

public class ResponseUserDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public Location? Location { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarPublicId { get; set; }
}
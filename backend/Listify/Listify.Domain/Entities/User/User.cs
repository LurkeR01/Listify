using Listify.Domain.Entities.Token;

namespace Listify.Domain.Entities.User;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public Location? Location { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarPublicId { get; set; }
    public IEnumerable<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
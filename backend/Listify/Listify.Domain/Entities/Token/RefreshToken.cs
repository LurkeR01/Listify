namespace Listify.Domain.Entities.Token;

public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TokenHash { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Revoked { get; set; }

    public User.User User { get; set; } = null!;
    public Guid UserId { get; set; }
}
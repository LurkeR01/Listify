using Listify.Domain;
using Listify.Domain.Entities.Token;

namespace Listify.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task <RefreshToken?> GetByHashAsync(string hash);
    Task AddAsync(RefreshToken refreshToken);
    Task RemoveAsync(RefreshToken refreshToken);
    Task SaveChangesAsync();
}
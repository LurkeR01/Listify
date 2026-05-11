using Listify.Application.DTOs.User;
using Listify.Domain;
using Listify.Domain.Entities.User;

namespace Listify.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    Task EditAsync(EditUserCommand command, Guid userId);
    Task AddUserRatingAsync(UserRating userRating, CancellationToken token);
    Task SaveChangesAsync();
}
using Listify.Application.DTOs.User;
using Listify.Domain;

namespace Listify.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    Task EditAsync(EditUserCommand command, Guid userId);
    Task SaveChangesAsync();
}
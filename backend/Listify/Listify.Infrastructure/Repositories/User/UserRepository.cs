using Listify.Application.DTOs.User;
using Listify.Application.Interfaces;
using Listify.Domain;
using Listify.Domain.Entities.User;
using Listify.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Listify.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _dbContext;

    public UserRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);
    }
    
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task AddAsync(User user) => await _dbContext.Users.AddAsync(user);

    public async Task EditAsync(EditUserCommand command, Guid userId)
    {
        await _dbContext.Users.Where(u => u.Id == userId)
            .ExecuteUpdateAsync(u => u
                .SetProperty(p => p.FirstName, command.FirstName)
                .SetProperty(p => p.LastName, command.LastName)
                .SetProperty(p => p.Email, command.Email)
                .SetProperty(p => p.PhoneNumber, command.PhoneNumber)
                .SetProperty(p => p.Location.Name, command.Location.Name)
                .SetProperty(p => p.Location.Ref, command.Location.Ref)
                .SetProperty(p => p.Location.Area, command.Location.Area)
                .SetProperty(p => p.AvatarUrl, command.AvatarUrl)
                .SetProperty(p => p.AvatarPublicId, command.AvatarPublicId)
        );
    }

    public async Task AddUserRatingAsync(UserRating userRating, CancellationToken token)
    {
        await _dbContext.UserRatings.AddAsync(userRating, token);
        await _dbContext.SaveChangesAsync(token);
    }
    
    public async Task SaveChangesAsync() => await _dbContext.SaveChangesAsync();
}
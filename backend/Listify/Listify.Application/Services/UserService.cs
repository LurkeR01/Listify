using Listify.Application.DTOs.User;
using Listify.Application.Exceptions;
using Listify.Application.Interfaces;
using Listify.Domain;

namespace Listify.Application.Services;

public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User> GetUserById(Guid userId) =>
        await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found");

    public async Task EditUser(EditUserCommand command, Guid userId) => await _userRepository.EditAsync(command, userId);
}
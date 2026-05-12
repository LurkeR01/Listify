using Listify.Application.Common.Interfaces.Chat;
using Listify.Application.DTOs.User;
using Listify.Application.Exceptions;
using Listify.Application.Interfaces;
using Listify.Domain;
using Listify.Domain.Entities.User;

namespace Listify.Application.Services;

public class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IChatRepository _chatRepository;

    public UserService(IUserRepository userRepository, IChatRepository chatRepository)
    {
        _userRepository = userRepository;
        _chatRepository = chatRepository;
    }

    public async Task<User> GetUserById(Guid userId) =>
        await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found");

    public async Task EditUser(EditUserCommand command, Guid userId) => await _userRepository.EditAsync(command, userId);

    public async Task RateUser(
        Guid ratedUserId,
        int rating,
        string? comment,
        Guid fromUserId,
        Guid listingId,
        CancellationToken token)
    {
        if (rating < 1 || rating > 5)
            throw new InvalidDataException("Rating must be between 1 and 5");
        
        if (await _userRepository.GetByIdAsync(ratedUserId) == null)
            throw new NotFoundException("User not found");

        var chat = await _chatRepository.GetByParticipantsAsync(listingId, fromUserId, ratedUserId, token);
        
        var userRating = UserRating.Create(rating, comment, fromUserId, ratedUserId, listingId);
        await _userRepository.AddUserRatingAsync(userRating, token);
    }

    public async Task<UserRating> GetByUserForListing(Guid userId, Guid listingId, CancellationToken token)
    {
        var userRating = await _userRepository.GetRatingByUserForListing(userId, listingId, token) ?? throw new NotFoundException("User not found");
        return userRating;
    }
    

    public async Task<List<UserRating>> GetUserRatings(Guid userId, CancellationToken token)
    {
        if (await _userRepository.GetByIdAsync(userId) == null)
            throw new NotFoundException("User not found");
        
        return await _userRepository.GetUserRatings(userId, token);
    }
}
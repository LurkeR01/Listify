using Listify.Api.DTOs.User;
using Listify.Domain.Entities.User;

namespace Listify.Api.Mappers;

public static class UserRatingMapping
{
    public static ResponseUserRatingDto ToResponse(this UserRating userRating)
    {
        return new ResponseUserRatingDto
        {
            Id = userRating.Id,
            ListingId = userRating.ListingId,
            Comment = userRating.Comment,
            CreatedAt = userRating.CreatedAt,
            Rating = userRating.Rating,
            FromUser = new ShortResponseUserDto
            {
                Id = userRating.FromUser.Id,
                FirstName = userRating.FromUser.FirstName,
                AvatarUrl = userRating.FromUser.AvatarUrl,
                AvatarPublicId = userRating.FromUser.AvatarPublicId,
            }
        };
    }
}
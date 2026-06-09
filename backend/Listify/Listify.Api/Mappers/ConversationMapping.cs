using Listify.Api.DTOs.Chat;
using Listify.Api.DTOs.User;
using Listify.Application.DTOs;
using Listify.Domain.Entities.Chat;

namespace Listify.Api.Mappers;

public static class ConversationMapping
{
    public static ResponseConversationDto ToResponse(this Conversation conversation)
    {
        if (conversation == null)
            throw new ArgumentNullException(nameof(conversation));

        if (conversation.Listing == null)
            throw new InvalidOperationException("Conversation.Listing is not loaded. Ensure it is Included before mapping.");

        return new ResponseConversationDto
        {
            Id = conversation.Id,
            ListingPreview = new ResponseListingPreviewDto
            {
                Id = conversation.Listing.Id,
                Title = conversation.Listing.Title,
                Price = conversation.Listing.Price,
            Location = new LocationDto
            {
                Name = conversation.Listing.Location?.Name ?? string.Empty,
                Area = conversation.Listing.Location?.Area ?? string.Empty,
                Ref = conversation.Listing.Location?.Ref ?? string.Empty,
            },
            ImageUrl = conversation.Listing.ListingImages?
                .FirstOrDefault(i => i.Order == 0)?.Url,
            },
            Buyer = new ShortResponseUserDto
            {
                Id = conversation.Buyer?.Id ?? conversation.BuyerId,
                FirstName = conversation.Buyer?.FirstName ?? string.Empty,
                AvatarUrl = conversation.Buyer?.AvatarUrl,
                AvatarPublicId = conversation.Buyer?.AvatarPublicId,
            },
            Seller = new ShortResponseUserDto
            {
                Id = conversation.Seller?.Id ?? conversation.SellerId,
                FirstName = conversation.Seller?.FirstName ?? string.Empty,
                AvatarUrl = conversation.Seller?.AvatarUrl,
                AvatarPublicId = conversation.Seller?.AvatarPublicId,
            },
            Messages = conversation.Messages
                .OrderBy(m => m.CreatedAt)
                .Select(m => m.ToResponse())
                .ToList(),
        };
    }

    public static MessageDto ToResponse(this Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            Text = message.Text,
            Sender = new ShortResponseUserDto
            {
                Id = message.SenderId,
                FirstName = message.Sender?.FirstName ?? string.Empty,
                AvatarUrl = message.Sender?.AvatarUrl,
                AvatarPublicId = message.Sender?.AvatarPublicId,
            },
            CreatedAt = message.CreatedAt,
        };
    }
}

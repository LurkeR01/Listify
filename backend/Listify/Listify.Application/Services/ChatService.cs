using Listify.Application.Common.Interfaces.Chat;
using Listify.Application.Exceptions;
using Listify.Domain.Entities.Chat;

namespace Listify.Application.Services;

public class ChatService
{
    private readonly IChatRepository _chatRepository;

    public ChatService(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }
    
    public async Task<Conversation> GetOrCreateConversation(
        Guid listingId,
        Guid buyerId,
        Guid sellerId,
        CancellationToken token)
    {
        var existing = await _chatRepository.GetByParticipantsAsync(
            listingId,
            buyerId, 
            sellerId,
            token);
        
        if (existing != null)
            return existing;

        var conversation = Conversation.Create(listingId, buyerId, sellerId);

        return await _chatRepository.CreateAsync(conversation, token);
    }

    public async Task<bool> IsUserInConversation(Guid userId, Guid conversationId, CancellationToken token)
    {
        var conversation = await _chatRepository.GetByIdAsync(conversationId, token);
        
        if (conversation == null)
            throw new NotFoundException("Conversation not found");

        return conversation.BuyerId == userId || conversation.SellerId == userId;
    }
}

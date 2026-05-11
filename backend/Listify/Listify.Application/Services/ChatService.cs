using Listify.Application.Common.Interfaces.Chat;
using Listify.Application.Exceptions;
using Listify.Application.Interfaces.Listing;
using Listify.Domain.Entities.Chat;

namespace Listify.Application.Services;

public class ChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IListingRepository _listingRepository;

    public ChatService(IChatRepository chatRepository, IListingRepository listingRepository)
    {
        _listingRepository = listingRepository;
        _chatRepository = chatRepository;
    }
    
    public async Task<Conversation> GetOrCreateConversation(
        Guid listingId,
        Guid buyerId,
        CancellationToken token)
    {
        var listing = await _listingRepository.GetListingAsNoTrackingAsync(listingId, token);
        var sellerId = listing.PublishedByUserId;
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
    
    public async Task<Message> SendMessageAsync(Guid conversationId, Guid userId, string text, CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new Exception("Empty message");

        var conversation = await _chatRepository.GetByIdAsync(conversationId, token);
        if (conversation == null)
            throw new Exception("Conversation not found");

        if (conversation.SellerId != userId && conversation.BuyerId != userId)
            throw new Exception("Forbidden");
        
        var message = Message.Create(conversationId, userId, text);
        conversation.AddMessage(message);
        await _chatRepository.SaveChangesAsync(token);

        return message;
    }

    public async Task<List<Conversation>> GetConversationsForUser(Guid userId, CancellationToken token) =>
        await _chatRepository.GetForUserAsync(userId, token);

    public async Task<Conversation> GetConversation(Guid listingId, Guid buyerId, Guid sellerId,
        CancellationToken token)
    {
        var conversation = await _chatRepository.GetConversation(listingId, buyerId, sellerId, token);
        if (conversation == null)
            throw new NotFoundException("Conversation not found");
        
        return conversation;
    }
}

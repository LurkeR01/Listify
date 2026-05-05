using Listify.Application.Common.Interfaces.Chat;
using Listify.Domain.Entities.Chat;
using Listify.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Listify.Infrastructure.Repositories.Chat;

public class ChatRepository : IChatRepository
{
    private readonly AppDbContext _dbContext;

    public ChatRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<Conversation> GetByParticipantsAsync(
        Guid listingId,
        Guid buyerId,
        Guid sellerId,
        CancellationToken token)
    {
        return await _dbContext.Conversations
            .Include(c => c.Listing)
                .ThenInclude(l => l.ListingImages)
            .Include(c => c.Buyer)
            .Include(c => c.Seller)
            .Include(c => c.Messages)
                .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(c => c.ListingId == listingId
                && c.BuyerId == buyerId
                && c.SellerId == sellerId, token);
    }

    public async Task<Conversation> GetByIdAsync(Guid conversationId, CancellationToken token)
    {
        return await _dbContext.Conversations
            .Include(c => c.Listing)
                .ThenInclude(l => l.ListingImages)
            .Include(c => c.Buyer)
            .Include(c => c.Seller)
            .Include(c => c.Messages)
                .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(c => c.Id == conversationId, token);
    }

    public async Task<Conversation> CreateAsync(Conversation conversation, CancellationToken token)
    {
        _dbContext.Conversations.Add(conversation);
        await _dbContext.SaveChangesAsync(token);

        return await GetByIdAsync(conversation.Id, token);
    }
}

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
            .Include(c => c.Messages
                .OrderByDescending(m => m.CreatedAt)
                .Take(1))
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
            .FirstOrDefaultAsync(c => c.Id == conversationId, token);
    }

    public async Task<List<Conversation>> GetForUserAsync(Guid userId, CancellationToken token)
    {
        return await _dbContext.Conversations
            .AsNoTracking()
            .Include(c => c.Listing)
                .ThenInclude(l => l.ListingImages)
            .Include(c => c.Buyer)
            .Include(c => c.Seller)
            .Include(c => c.Messages
                .OrderByDescending(m => m.CreatedAt)
                .Take(1))
                .ThenInclude(m => m.Sender)
            .Where(c => c.BuyerId == userId || c.SellerId == userId)
            .OrderByDescending(c => c.Messages
                .Select(m => (DateTime?)m.CreatedAt)
                .Max() ?? c.CreatedAt)
            .AsSplitQuery()
            .ToListAsync(token);
    }

    public async Task<Conversation> CreateAsync(Conversation conversation, CancellationToken token)
    {
        await _dbContext.Conversations.AddAsync(conversation, token);
        await _dbContext.SaveChangesAsync(token);

        return await GetByIdAsync(conversation.Id, token);
    }

    public async Task<Conversation> GetConversation(Guid listingId, Guid buyerId, Guid sellerId,
        CancellationToken token)
        => await _dbContext.Conversations
            .Include(c => c.Listing)
                .ThenInclude(l => l.ListingImages)
            .Include(c => c.Buyer)
            .Include(c => c.Seller)
            .Include(c => c.Messages
                .OrderByDescending(m => m.CreatedAt)
                .Take(1))
                .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(c =>
                c.ListingId == listingId && c.BuyerId == buyerId && c.SellerId == sellerId, token);

    public async Task<List<Message>> GetMessagesAsync(
        Guid conversationId,
        int page,
        int pageSize,
        CancellationToken token)
    {
        var messages = await _dbContext.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(token);

        return messages
            .OrderBy(m => m.CreatedAt)
            .ToList();
    }

    public async Task SaveChangesAsync(CancellationToken token) => await _dbContext.SaveChangesAsync(token);
}

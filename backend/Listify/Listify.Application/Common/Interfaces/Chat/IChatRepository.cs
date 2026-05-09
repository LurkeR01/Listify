using Listify.Domain.Entities.Chat;

namespace Listify.Application.Common.Interfaces.Chat;

public interface IChatRepository
{
    Task<Conversation> GetByParticipantsAsync(
        Guid listingId,
        Guid buyerId, 
        Guid sellerId,
        CancellationToken token);
    
    Task<Conversation> GetByIdAsync(Guid conversationId, CancellationToken token);
    Task<List<Conversation>> GetForUserAsync(Guid userId, CancellationToken token);

    Task<Conversation> CreateAsync(Conversation conversation, CancellationToken token);
    Task SaveChangesAsync(CancellationToken token);
}

using System.Security.Claims;
using Listify.Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Listify.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }
    
    public async Task JoinChat(string conversationId)
    {
        try
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

            _logger.LogInformation("JoinChat requested. ConnectionId={ConnectionId}, ConversationId={ConversationId}, UserIdClaim={UserIdClaim}",
                Context.ConnectionId, conversationId, userId ?? "<null>");

            if (!Guid.TryParse(conversationId, out var convId))
                throw new HubException("Invalid conversation id");
            if (!Guid.TryParse(userId, out var guidUserId))
                throw new HubException("Invalid user id");

            var isParticipant = await _chatService.IsUserInConversation(guidUserId, convId, Context.ConnectionAborted);

            if (!isParticipant)
                throw new HubException("Access denied");

            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }
        catch (HubException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "JoinChat failed. ConnectionId={ConnectionId}, ConversationId={ConversationId}", Context.ConnectionId, conversationId);
            throw new HubException(ex.Message);
        }
    }
    
    public async Task SendMessage(string conversationId, string text)
    {
        var userId = Context.UserIdentifier;
        if (userId == null)
            throw new HubException("Unauthorized");

        var message = await _chatService.SendMessageAsync(
            Guid.Parse(conversationId),
            Guid.Parse(userId),
            text,
            Context.ConnectionAborted
        );

        await Clients.Group(conversationId).SendAsync("ReceiveMessage", new
        {
            id = message.Id,
            text = message.Text,
            senderId = message.SenderId,
            createdAt = message.CreatedAt
        });
    }
}

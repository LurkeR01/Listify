using System.Security.Claims;
using Listify.Api.DTOs.Chat;
using Listify.Api.Mappers;
using Listify.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Listify.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;

        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }

        [Authorize]
        [HttpPost("connect")]
        public async Task<IActionResult> GetConversation([FromBody] RequestConnectionDto dto, CancellationToken token)
        {
            var buyerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var conversation = await _chatService.GetOrCreateConversation(
                dto.ListingId,
                buyerId,
                dto.SellerId,
                token
            );

            return Ok(conversation.ToResponse());
        }
    }
}

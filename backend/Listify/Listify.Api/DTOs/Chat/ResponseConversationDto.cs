using System.ComponentModel.DataAnnotations;
using Listify.Application.DTOs;

namespace Listify.Api.DTOs.Chat;

public class ResponseConversationDto
{
    public Guid Id { get; set; }
    public ResponseListingPreviewDto ListingPreview { get; set; }
    public List<ShortResponseUserDto> Participants { get; set; }
    
    [MaxLength(20)]
    public List<MessageDto> LastMessages { get; set; }
}
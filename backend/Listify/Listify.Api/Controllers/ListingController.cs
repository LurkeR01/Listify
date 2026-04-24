using System.Security.Claims;
using Listify.Api.DTOs.Listing;
using Listify.Api.Mappers;
using Listify.Application.DTOs;
using Listify.Application.Interfaces.Listing;
using Listify.Application.Services;
using Listify.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;

namespace Listify.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListingController : ControllerBase
    {
        private readonly ListingService _listingService;

        public ListingController(ListingService listingService)
        {
            _listingService = listingService;
        }
        
        [Authorize]
        [HttpPost("create")]
        public async Task<ActionResult> Create([FromBody] CreateListingDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var command = new CreateListingCommand{
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Location = new LocationDto
                {
                    Name = dto.Location.Name,
                    Ref = dto.Location.Ref,
                    Area = dto.Location.Area
                },
                PublishedByUserId = userId,
                CategoryId = dto.CategoryId,
                ListingAttributeDtos = dto.ListingAttributeDtos.Select(la =>
                    new ListingAttributeInput{ CategoryAttributeValueId = la.CategoryAttributeValueId }),
                ListingImageDtos = dto.ListingImageDtos.Select(li =>
                    new ListingImageInput { Url = li.Url, Order = li.Order, PublicId = li.PublicId })
            };
            
            await _listingService.CreateListingAsync(command);
            return NoContent();
        }

        [Authorize]
        [HttpPatch("update")]
        public async Task<IActionResult> Update([FromBody] UpdateListingDto dto, CancellationToken token)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var command = new UpdateListingCommand{
                Id = dto.Id,
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Location = new LocationDto
                {
                    Name = dto.Location.Name,
                    Ref = dto.Location.Ref,
                    Area = dto.Location.Area
                },
                CategoryId = dto.CategoryId,
                ListingAttributeDtos = dto.ListingAttributeDtos.Select(la =>
                    new ListingAttributeInput { CategoryAttributeValueId = la.CategoryAttributeValueId }),
                ListingImageDtos = dto.ListingImageDtos.Select(li =>
                    new ListingImageInput
                    {
                        Id = li.Id,
                        Url = li.Url,
                        Order = li.Order,
                        PublicId = li.PublicId
                    })
            };

            await _listingService.UpdateListingAsync(command, userId, token);
            return Ok();
        }

        [HttpPost("search")]
        public async Task<IActionResult> Get([FromBody] GetListingsQuery request, CancellationToken cancellationToken)
        {
            var response = await _listingService.HandleQuery(request, cancellationToken);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOne([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var listing = await _listingService.GetListingAsync(id, cancellationToken);
            return Ok(listing.ToResponse());
        }

        [Authorize]
        [HttpGet("getForUser")]
        public async Task<IActionResult> GetForUser(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var response = await _listingService.GetForUser(userId, cancellationToken);
            return Ok(response);
        }
        
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _listingService.DeleteListingAsync(id, userId, cancellationToken);
            
            return NoContent();
        }

        [Authorize]
        [HttpPatch("{listingId}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] Guid listingId, [FromBody] UpdateStatusDto dto,
            CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _listingService.UpdateStatusAsync(listingId, userId, dto.Status, cancellationToken);
            
            return NoContent();
        }
    }
}

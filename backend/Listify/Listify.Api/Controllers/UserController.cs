using System.Security.Claims;
using Listify.Api.DTOs.Listing;
using Listify.Api.DTOs.User;
using Listify.Api.Mappers;
using Listify.Application.DTOs.User;
using Listify.Application.DTOs;
using Listify.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Listify.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _userService.GetUserById(userId);
            ResponseUserDto responseUserDto = new()
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RegisteredAt = user.RegisteredAt,
                PhoneNumber = user.PhoneNumber,
                Location = user.Location,
                AvatarUrl = user.AvatarUrl,
            };
            return Ok(responseUserDto);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetById(Guid userId)
        {
            var user = await _userService.GetUserById(userId);
            ResponseUserDto responseUserDto = new()
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RegisteredAt = user.RegisteredAt,
                PhoneNumber = user.PhoneNumber,
                Location = user.Location,
                AvatarUrl = user.AvatarUrl,
            };
            return Ok(responseUserDto);
        }

        [Authorize]
        [HttpPatch("edit")]
        public async Task<IActionResult> EditUser([FromBody] EditUserRequestDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            EditUserCommand command = new EditUserCommand
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Location = new LocationDto
                {
                    Name = dto.Location.Name,
                    Ref = dto.Location.Ref,
                    Area = dto.Location.Area
                },
                AvatarUrl = dto.AvatarUrl,
                AvatarPublicId = dto.AvatarPublicId,
            };

            await _userService.EditUser(command, userId);

            return Ok();
        }

        [Authorize]
        [HttpPost("rate")]
        public async Task<IActionResult> RateUser(CreateUserRatingDto dto, CancellationToken token)
        {
            var fromUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            await _userService.RateUser(
                dto.RatedUserId,
                dto.Rating,
                dto.Comment,
                fromUserId,
                dto.ListingId,
                token
                );
            
            
            return Ok();
        }

        [Authorize]
        [HttpGet("getByUserForListing/{listingId}")]
        public async Task<IActionResult> GetByUserForListing(Guid listingId, CancellationToken token)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var usreRating = await _userService.GetByUserForListing(userId, listingId, token);
            return Ok(usreRating);
        }
        

        [HttpGet("getUserRatings/{userId}")]
        public async Task<IActionResult> GetUserRatings(Guid userId, CancellationToken token)
        {
            var userRatings = await _userService.GetUserRatings(userId, token);
            return Ok(userRatings.Select(ur => ur.ToResponse()));
        }
    }
}

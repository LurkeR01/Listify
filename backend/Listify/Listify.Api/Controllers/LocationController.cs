using Listify.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Listify.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly LocationService _locationService;

        public LocationController(LocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCities([FromQuery] string q, CancellationToken cancellationToken)
        {
            var result = await _locationService.SearchCities(q, cancellationToken);
            return Ok(result);
        }
    }
}

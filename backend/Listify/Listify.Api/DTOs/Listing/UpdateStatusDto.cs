using Listify.Domain.Enums;

namespace Listify.Api.DTOs.Listing;

public class UpdateStatusDto
{
    public ListingStatus Status { get; set; }
}
using Listify.Domain.Enums;

namespace Listify.Application.Interfaces.Listing;

public interface IListingRepository
{
    Task CreateListingAsync(Domain.Entities.Listing.Listing newListing);
    Task DeleteListingAsync(Guid listingId, CancellationToken cancellationToken);
    Task<Domain.Entities.Listing.Listing> GetListingAsync(Guid listingId, CancellationToken token);
    Task<Domain.Entities.Listing.Listing> GetListingAsNoTrackingAsync(Guid listingId, CancellationToken token);
    Task UpdateStatusAsync(Guid listingId, ListingStatus newStatus, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken token);
}
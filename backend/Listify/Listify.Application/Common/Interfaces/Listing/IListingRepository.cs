using Listify.Domain.Enums;

namespace Listify.Application.Interfaces.Listing;

public interface IListingRepository
{
    Task CreateListingAsync(Domain.Listing newListing);
    Task DeleteListingAsync(Guid listingId, CancellationToken cancellationToken);
    Task<Domain.Listing> GetListingAsync(Guid listingId, CancellationToken token);
    Task<Domain.Listing> GetListingAsNoTrackingAsync(Guid listingId, CancellationToken token);
    Task UpdateStatusAsync(Guid listingId, ListingStatus newStatus, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken token);
}
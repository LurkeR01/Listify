using Listify.Application.Interfaces.Listing;
using Listify.Application.Exceptions;
using Listify.Domain.Enums;
using Listify.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Listify.Infrastructure.Repositories.Listing;

public class ListingRepository : IListingRepository
{
    private readonly AppDbContext _dbContext;

    public ListingRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task CreateListingAsync(Domain.Listing newListing)
    {
        _dbContext.Listings.Add(newListing);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Domain.Listing> GetListingAsync(Guid listingId, CancellationToken token)
    {
        var listing = await _dbContext.Listings
            .Include(l => l.PublishedByUser)
            .Include(l => l.Category)
            .Include(l => l.ListingImages)
            .Include(l => l.ListingAttributeValues)
                .ThenInclude(v => v.CategoryAttributeValue)
                    .ThenInclude(a => a.CategoryAttribute)
            .FirstOrDefaultAsync(l => l.Id == listingId, token);

        return listing;
    }

    public async Task<Domain.Listing> GetListingAsNoTrackingAsync(Guid listingId, CancellationToken token) 
        => await _dbContext.Listings
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == listingId, token);

    public async Task DeleteListingAsync(Guid listingId, CancellationToken token)
    {
        await _dbContext.Listings.Where(l => l.Id == listingId).ExecuteDeleteAsync(token);
    }
     
    public async Task SaveChangesAsync(CancellationToken token)
    {
        await _dbContext.SaveChangesAsync(token);
    }

    public async Task UpdateStatusAsync(Guid listingId, ListingStatus newStatus, CancellationToken token)
    {
        await _dbContext.Listings.Where(l => l.Id == listingId)
            .ExecuteUpdateAsync(
                s => s.SetProperty(l => l.Status, newStatus), token);
    }
}

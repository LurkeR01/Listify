using Listify.Domain;
using Listify.Domain.Entities.Listing;
using Microsoft.EntityFrameworkCore;

namespace Listify.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Listing> Listings { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
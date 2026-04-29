using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Listing;

public class ListingConfigurations : IEntityTypeConfiguration<Domain.Entities.Listing.Listing>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Listing.Listing> builder)
    {
        builder.HasKey(l => l.Id);

        builder.HasMany(l => l.ListingAttributeValues)
            .WithOne(lav => lav.Listing)
            .HasForeignKey(lav => lav.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.ListingImages)
            .WithOne(li => li.Listing)
            .HasForeignKey(li => li.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.OwnsOne(l => l.Location, loc =>
        {
            loc.Property(x => x.Name).HasColumnName("LocationName");
            loc.Property(x => x.Ref).HasColumnName("LocationRef");
            loc.Property(x => x.Area).HasColumnName("LocationArea");
        });
    }
}
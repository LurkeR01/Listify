using Listify.Domain;
using Listify.Domain.Entities.Listing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Listing;

public class ListingAttributeValueConfigurations : IEntityTypeConfiguration<ListingAttributeValue>
{
    public void Configure(EntityTypeBuilder<ListingAttributeValue> builder)
    {
        builder.HasKey(lav => lav.Id);
        builder.HasOne(lav => lav.Listing)
            .WithMany(l => l.ListingAttributeValues)
            .HasForeignKey(lav => lav.ListingId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(lav => lav.CategoryAttributeValue)
            .WithMany()
            .HasForeignKey(lav => lav.CategoryAttributeValueId)
            .OnDelete(DeleteBehavior.Restrict); 
        
        builder.HasIndex(lav => new { lav.ListingId, lav.CategoryAttributeValueId })
            .IsUnique();
    }
}
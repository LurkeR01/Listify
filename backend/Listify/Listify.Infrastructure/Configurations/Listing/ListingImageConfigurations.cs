using Listify.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Listing;

public class ListingImageConfigurations : IEntityTypeConfiguration<ListingImage>
{
    public void Configure(EntityTypeBuilder<ListingImage> builder)
    {
        builder.HasKey(li => li.Id);
        builder.Property(li => li.Id).ValueGeneratedOnAdd();
        builder.Property(li => li.Url).IsRequired();
        builder.Property(li => li.PublicId).IsRequired();
        
        builder.HasOne(li => li.Listing)
            .WithMany(l => l.ListingImages)
            .HasForeignKey(li => li.ListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
using Listify.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations;

public class UserRatingConfigurations : IEntityTypeConfiguration<UserRating>
{
    public void Configure(EntityTypeBuilder<UserRating> builder)
    {
        builder.HasKey(ur => ur.Id);
        builder.Property(ur => ur.Rating).IsRequired();
        builder.HasOne(ur => ur.FromUser)
            .WithMany()
            .HasForeignKey(ur => ur.FromUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(ur => ur.ToUser)
            .WithMany()
            .HasForeignKey(ur => ur.ToUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(ur => ur.Listing)
            .WithMany()
            .HasForeignKey(ur => ur.ListingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(ur => new { ur.ListingId, ur.FromUserId, ur.ToUserId }).IsUnique();
    }
}
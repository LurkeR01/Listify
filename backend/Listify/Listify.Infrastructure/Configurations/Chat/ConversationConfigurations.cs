using Listify.Domain.Entities.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Chat;

public class ConversationConfigurations : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.HasOne(c => c.Listing)
            .WithMany()
            .HasForeignKey(c => c.ListingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Participants)
            .WithOne(p => p.Conversation)
            .HasForeignKey(p => p.ConversationId);

        builder.HasMany(c => c.Messages)
            .WithOne(m => m.Conversation)
            .HasForeignKey(m => m.ConversationId);
    }
}
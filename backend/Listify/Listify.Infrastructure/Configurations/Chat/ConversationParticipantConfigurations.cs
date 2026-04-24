using Listify.Domain.Entities.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Chat;

public class ConversationParticipantConfigurations : IEntityTypeConfiguration<ConversationParticipant>
{
    public void Configure(EntityTypeBuilder<ConversationParticipant> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.JoinedAt)
            .IsRequired();

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => new { p.ConversationId, p.UserId })
            .IsUnique();
    }
}
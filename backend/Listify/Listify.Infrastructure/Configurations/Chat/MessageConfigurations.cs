using Listify.Domain.Entities.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Chat;

public class MessageConfigurations : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Text)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        builder.HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => m.ConversationId);

        builder.HasIndex(m => m.CreatedAt);
    }
}
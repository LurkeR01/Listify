using Listify.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations.Category;

public class CategoryConfigurations : IEntityTypeConfiguration<Domain.Entities.Category.Category>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Category.Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired();
        builder.HasIndex(c => c.ParentId);
        
        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(c => c.CategoryAttributes)
            .WithOne(c => c.Category)
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(ca => new { ca.Id, ca.Name })
            .IsUnique();
    }
}
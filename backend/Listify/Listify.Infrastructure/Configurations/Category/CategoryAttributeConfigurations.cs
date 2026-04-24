using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Listify.Domain;

namespace Listify.Infrastructure.Configurations.Category;

public class CategoryAttributeConfigurations : IEntityTypeConfiguration<CategoryAttribute>
{
    public void Configure(EntityTypeBuilder<CategoryAttribute> builder)
    {
        builder.HasKey(ca => ca.Id);
        builder.Property(ca => ca.Name).IsRequired();
        builder.HasOne(ca => ca.Category)
            .WithMany(c => c.CategoryAttributes)
            .HasForeignKey(ca => ca.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
using Listify.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Listify.Infrastructure.Configurations;

public class UserConfigurations : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(50);
        builder.Property(u => u.PhoneNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(u => u.Email).IsUnique();
        
        builder.OwnsOne(u => u.Location, loc =>
        {
            loc.Property(x => x.Name).HasColumnName("LocationName");
            loc.Property(x => x.Ref).HasColumnName("LocationRef");
            loc.Property(x => x.Area).HasColumnName("LocationArea");
        });
    }
}
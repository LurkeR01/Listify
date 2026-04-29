using Listify.Application.Common.Interfaces;
using Listify.Domain;
using Listify.Domain.Entities.Category;
using Listify.Domain.Entities.Chat;
using Listify.Domain.Entities.Listing;
using Listify.Domain.Entities.Token;
using Listify.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace Listify.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CategoryAttribute> CategoryAttributes => Set<CategoryAttribute>();
    public DbSet<CategoryAttributeValue> CategoryAttributeValues => Set<CategoryAttributeValue>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<ListingAttributeValue> ListingAttributeValues => Set<ListingAttributeValue>();
    public DbSet<ListingImage> ListingImages => Set<ListingImage>();
    public DbSet<UserRating> UserRatings => Set<UserRating>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
    public DbSet<Message> Messages => Set<Message>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
using Listify.Domain.DTOs;
using Listify.Domain.Enums;

namespace Listify.Domain.Entities.Listing;

public class Listing
{
    private Listing () { }
    
    private readonly List<ListingAttributeValue> _listingAttributeValues = new();
    private readonly List<ListingImage> _listingImages = new();
    
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Title { get; private set; }
    public string Description { get; private set; }
    public decimal Price { get; private set; }
    public Location Location { get; private set; }
    
    public Guid PublishedByUserId { get; private set; }
    public User.User PublishedByUser { get; private set; }
    
    public DateTime CreatedOn { get; private set; }
    public ListingStatus Status { get; set; }
    
    public int CategoryId { get; private set; }
    public Category.Category Category { get; private set; }
    
    public IReadOnlyCollection<ListingAttributeValue> ListingAttributeValues => _listingAttributeValues;
    public IReadOnlyCollection<ListingImage> ListingImages => _listingImages;

    public static Listing Create(
        string title,
        string description,
        decimal price,
        Location location,
        Guid publishedByUserId,
        int categoryId
    )
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required");
        
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required");

        if (price < 0)
            throw new ArgumentException("Price cannot be negative");
        
        return new Listing
        {
            Title = title,
            Description = description,
            Price = price,
            Location = location,
            PublishedByUserId = publishedByUserId,
            CategoryId = categoryId,
            CreatedOn = DateTime.Now,
            Status = ListingStatus.Draft
        };
    }

    public void Update(
        string title,
        string description,
        decimal price,
        int categoryId)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required");
        
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required");

        if (price < 0)
            throw new ArgumentException("Price cannot be negative");
        
        Title = title;
        Description = description;
        Price = price;
        CategoryId = categoryId;
    }
    
    public void AddAttribute(int categoryAttributeValueId)
    {
        _listingAttributeValues.Add(
            ListingAttributeValue.Create(categoryAttributeValueId, Id));
    }

    public void AddImage(string url, int order, string publicId)
    {
        _listingImages.Add(ListingImage.Create(url, order, publicId, Id));
    }
    
    public void UpdateAttributes(List<int> newValueIds)
    {
        var toRemove = _listingAttributeValues
            .Where(x => !newValueIds.Contains(x.CategoryAttributeValueId))
            .ToList();

        foreach (var item in toRemove)
            _listingAttributeValues.Remove(item);

        var existingIds = _listingAttributeValues
            .Select(x => x.CategoryAttributeValueId)
            .ToHashSet();

        var toAdd = newValueIds
            .Where(id => !existingIds.Contains(id));

        foreach (var id in toAdd)
        {
            _listingAttributeValues.Add(
                ListingAttributeValue.Create(id, Id));
        }
    }

    public void UpdateImages(List<ListingImageDto> newImages)
    {
        // Удаление
        var toRemove = _listingImages
            .Where(old => !newImages.Any(n => n.Id == old.Id))
            .ToList();

        foreach (var img in toRemove)
            _listingImages.Remove(img);

        // Обновление
        foreach (var existing in _listingImages)
        {
            var updated = newImages.FirstOrDefault(n => n.Id == existing.Id);
            if (updated != null)
            {
                existing.Update(updated.Url, updated.Order);
            }
        }

        // Добавление
        var toAdd = newImages
            .Where(n => n.Id == null);

        foreach (var img in toAdd)
        {
            _listingImages.Add(
                ListingImage.Create(img.Url, img.Order, img.PublicId, Id));
        }
    }
}
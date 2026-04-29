using Listify.Domain.Entities.Category;

namespace Listify.Domain.Entities.Listing;

public class ListingAttributeValue
{
    private ListingAttributeValue() { }

    public int Id { get; private set; }
    public Guid ListingId { get; private set; }
    public Listing Listing { get; private set; }
    public int CategoryAttributeValueId { get; private set; }
    public CategoryAttributeValue CategoryAttributeValue { get; private set; }

    public static ListingAttributeValue Create(
        int categoryAttributeValueId,
        Guid listingId
    )
    {
        return new ListingAttributeValue
        {
            ListingId = listingId,
            CategoryAttributeValueId = categoryAttributeValueId,
        };
    }
}
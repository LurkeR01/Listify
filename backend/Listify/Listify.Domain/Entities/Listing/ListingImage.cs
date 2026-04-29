namespace Listify.Domain.Entities.Listing;

public class ListingImage
{
    public Guid Id { get; private set; }
    public Guid ListingId { get; private set; }
    public Listing Listing { get; private set; }
    public string Url { get; private set; }
    public int Order { get; private set; }
    public string PublicId { get; private set; }

    public static ListingImage Create(
        string url,
        int order,
        string publicId,
        Guid listingId
    )
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Url is required");

        return new ListingImage
        {
            Url = url,
            Order = order,
            PublicId = publicId,
            ListingId = listingId
        };
    }

    public void Update(string url, int order)
    {
        Url = url;
        Order = order;
    }
}
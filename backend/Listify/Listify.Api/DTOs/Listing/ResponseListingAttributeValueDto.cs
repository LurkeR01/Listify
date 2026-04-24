using Listify.Api.DTOs.Category;

namespace Listify.Api.DTOs.Listing;

public class ResponseListingAttributeValueDto
{
    public int Id { get; set; }
    public string CategoryAttributeName { get; set; }
    public string CategoryAttributeValue { get; set; }
}
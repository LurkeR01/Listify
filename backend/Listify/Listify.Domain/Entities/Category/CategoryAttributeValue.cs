namespace Listify.Domain.Entities.Category;

public class CategoryAttributeValue
{
    public int Id { get; set; }
    public int CategoryAttributeId { get; set; }
    public CategoryAttribute CategoryAttribute { get; set; }
    public string Value { get; set; }
}
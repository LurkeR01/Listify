using Listify.Domain.Enums;

namespace Listify.Domain;

public class CategoryAttribute
{
    public int Id { get; set; }
    public string Name { get; set; }
    public bool IsRequired { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    
    private readonly List<CategoryAttributeValue> _categoryAttributeValues = new();
    public IReadOnlyCollection<CategoryAttributeValue> CategoryAttributeValues => _categoryAttributeValues;
}
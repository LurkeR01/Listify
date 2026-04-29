namespace Listify.Domain.Entities.Category;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public Category? Parent { get; set; }
    public string? Slug { get; set; } = string.Empty;
    public string? IconKey { get; set; } = string.Empty;
    public IEnumerable<Category> Children { get; set; } = new List<Category>();
    public IEnumerable<CategoryAttribute> CategoryAttributes { get; set; } = new List<CategoryAttribute>();
}
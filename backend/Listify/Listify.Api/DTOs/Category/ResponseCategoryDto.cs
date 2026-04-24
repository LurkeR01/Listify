namespace Listify.Api.DTOs.Category;

public class ResponseCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? ParentId { get; set; }
    public string Slug { get; set; }
    public string IconKey { get; set; }
}
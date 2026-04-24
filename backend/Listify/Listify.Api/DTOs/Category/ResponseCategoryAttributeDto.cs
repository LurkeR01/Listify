namespace Listify.Api.DTOs.Category;

public class ResponseCategoryAttributeDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<ResponseCategoryAttributeValueDto> Values { get; set; }
}
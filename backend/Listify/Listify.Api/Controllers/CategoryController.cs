using Listify.Api.DTOs.Category;
using Listify.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Listify.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoryController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories.Select(c => 
                new ResponseCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    ParentId = c.ParentId,
                    Slug = c.Slug,
                    IconKey = c.IconKey,
                }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryAttributes([FromRoute] int id)
        {
            var categorieAttributes = await _categoryService.GetCategoryAttributesAsync(id);
            return Ok(categorieAttributes.Select(ca => 
                new ResponseCategoryAttributeDto
                {
                    Id = ca.Id,
                    Name = ca.Name,
                    Values = ca.CategoryAttributeValues.Select(cav => 
                        new ResponseCategoryAttributeValueDto
                        {
                            Id = cav.Id,
                            Value = cav.Value,
                            CategoryAttributeId = cav.CategoryAttributeId
                        }).ToList()
                }));
        }
    }
}

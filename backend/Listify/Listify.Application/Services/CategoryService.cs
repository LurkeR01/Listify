using Listify.Application.Common.Interfaces.Category;
using Listify.Domain;
using Listify.Domain.Entities.Category;

namespace Listify.Application.Services;

public class CategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    
    public CategoryService(ICategoryRepository categoryRepository)
    { 
        _categoryRepository = categoryRepository;
    }

    public async Task<List<Category>> GetAllCategoriesAsync() => await _categoryRepository.GetAllCategoriesAsync();

    public async Task<List<CategoryAttribute>> GetCategoryAttributesAsync(int categoryId) => await _categoryRepository.GetCategoryAttributeAsync(categoryId);
}
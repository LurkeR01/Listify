using Listify.Domain;
using Listify.Application.DTOs;
using Listify.Domain.Entities.Category;

namespace Listify.Application.Common.Interfaces.Category;

public interface ICategoryRepository
{
    Task<int> CountValidAttributesAsync(CreateListingCommand command);
    Task<List<Domain.Entities.Category.Category>> GetAllCategoriesAsync();
    Task<Domain.Entities.Category.Category> GetByIdAsync(int id);
    Task<List<CategoryAttribute>> GetCategoryAttributeAsync(int categoryId);
    Task<List<int>> GetCategoryIdsAsync(int categoryId);
}
using Listify.Domain;
using Listify.Application.DTOs;

namespace Listify.Application.Common.Interfaces.Category;

public interface ICategoryRepository
{
    Task<int> CountValidAttributesAsync(CreateListingCommand command);
    Task<List<Domain.Category>> GetAllCategoriesAsync();
    Task<Domain.Category> GetByIdAsync(int id);
    Task<List<CategoryAttribute>> GetCategoryAttributeAsync(int categoryId);
    Task<List<int>> GetCategoryIdsAsync(int categoryId);
}
using Listify.Domain;
using Listify.Application.Common.Interfaces.Category;
using Listify.Application.DTOs;
using Listify.Domain.Entities.Category;
using Listify.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Listify.Infrastructure.Repositories.Category;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _dbContext;

    public CategoryRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<List<Domain.Entities.Category.Category>> GetAllCategoriesAsync()
    {
        return _dbContext.Categories.ToListAsync();
    }
    
    public async Task<Domain.Entities.Category.Category> GetByIdAsync(int id) => await _dbContext.Categories.FindAsync(id);
    
    public async Task<int> CountValidAttributesAsync(CreateListingCommand command)
    {
        var valueIds = command.ListingAttributeDtos
            .Select(a => a.CategoryAttributeValueId)
            .ToList();

        return await _dbContext.CategoryAttributeValues
            .Where(v => valueIds.Contains(v.Id))
            .Where(v => v.CategoryAttribute.CategoryId == command.CategoryId)
            .CountAsync();
    }

    public async Task<List<CategoryAttribute>> GetCategoryAttributeAsync(int categoryId)
    {
       return await _dbContext.CategoryAttributes
           .Where(ca => ca.CategoryId == categoryId)
           .Include(ca => ca.CategoryAttributeValues)
           .ToListAsync();
    }

    public async Task<List<int>> GetCategoryIdsAsync(int categoryId)
    {
        var result = new List<int> { categoryId };

        var children = await _dbContext.Categories
            .Where(c => c.ParentId == categoryId)
            .Select(c => c.Id)
            .ToListAsync();

        foreach (var childId in children)
        {
            result.AddRange(await GetCategoryIdsAsync(childId));
        }

        return result;
    }
}
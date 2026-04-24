namespace Listify.Application.DTOs;

public record GetListingsQuery(
    int? CategoryId,
    string? SearchText,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? LocationRef,
    List<AttributeFilterDto>? AttributeFilters
    );
namespace Listify.Application.DTOs;

public record PaginationParams(
    int Page = 1,
    int PageSize = 20);

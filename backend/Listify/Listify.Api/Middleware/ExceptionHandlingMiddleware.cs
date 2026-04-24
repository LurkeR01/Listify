using Listify.Application.Exceptions;
using Listify.Application.Exceptions.AuthExceptions;
using Listify.Domain.Exceptions;

namespace Listify.Api.MIddleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            await HandleExceptionAsync(context, ex);
        }
        // catch (Exception)
        // {
        //     context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        //     await context.Response.WriteAsJsonAsync( new { error = "Internal Server Error" });
        // }
    }

    private static async Task HandleExceptionAsync(HttpContext context, DomainException ex)
    {
        context.Response.StatusCode = ex switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            ForbiddenException => StatusCodes.Status403Forbidden,
            AlreadyExistsException => StatusCodes.Status409Conflict,
            InvalidCredentialsException => StatusCodes.Status401Unauthorized,
            InvalidRefreshTokenException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status400BadRequest,
        };
        
        await context.Response.WriteAsJsonAsync( new { error = ex.Message });
    }
}

using Listify.Domain.Exceptions;

namespace Listify.Application.Exceptions;

public class ForbiddenException : DomainException
{
    public ForbiddenException(string message) : base(message) {}
}
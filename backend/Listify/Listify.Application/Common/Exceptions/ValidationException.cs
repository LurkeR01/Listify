using Listify.Domain.Exceptions;

namespace Listify.Application.Exceptions;

public class ValidationException : DomainException
{
    public ValidationException(string message) : base(message) { }
}

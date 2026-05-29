using Listify.Domain.Exceptions;

namespace Listify.Application.Exceptions;

public class BadRequestException : DomainException
{
    public BadRequestException(string message) : base(message) { }
}

using Listify.Domain.Exceptions;

namespace Listify.Application.Exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message) {}
}
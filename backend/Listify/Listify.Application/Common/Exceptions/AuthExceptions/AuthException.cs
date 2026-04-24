using Listify.Domain.Exceptions;

namespace Listify.Application.Exceptions.AuthExceptions;

public class AuthException : DomainException
{
    public AuthException(string message) : base(message) {}
}
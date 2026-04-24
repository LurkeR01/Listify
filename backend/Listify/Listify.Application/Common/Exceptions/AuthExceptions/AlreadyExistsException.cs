namespace Listify.Application.Exceptions.AuthExceptions;

public class AlreadyExistsException : AuthException
{
    public AlreadyExistsException(string message) : base($"User with this {message} already exists") {}
}
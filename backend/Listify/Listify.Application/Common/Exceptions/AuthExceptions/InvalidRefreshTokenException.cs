namespace Listify.Application.Exceptions.AuthExceptions;

public class InvalidRefreshTokenException : AuthException
{
    public InvalidRefreshTokenException(string message) : base(message) { }
}
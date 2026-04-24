namespace Listify.Application.Exceptions.AuthExceptions;

public class InvalidCredentialsException : AuthException
{
    public InvalidCredentialsException() : base("Invalid credentials") {}
}
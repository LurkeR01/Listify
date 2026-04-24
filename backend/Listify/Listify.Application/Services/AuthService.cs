using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Listify.Application.Exceptions;
using Listify.Application.Exceptions.AuthExceptions;
using Listify.Application.Interfaces;
using Listify.Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Listify.Application.Services;

public class AuthService
{
    private readonly IUserRepository _usersRepository;
    private readonly IRefreshTokenRepository _refreshTokensRepository;
    private readonly IConfiguration _config;

    public AuthService(
        IUserRepository usersRepository,
        IRefreshTokenRepository refreshTokensRepository,
        IConfiguration config)
    {
        _usersRepository = usersRepository;
        _refreshTokensRepository = refreshTokensRepository;
        _config = config;
    }


    public async Task RegisterAsync(
        string email, 
        string password, 
        string firstName, 
        string lastName, 
        string phoneNumber)
    {
        if (await _usersRepository.GetByEmailAsync(email) != null)
            throw new AlreadyExistsException("email");

        User newUser = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
            RegisteredAt = DateTime.UtcNow,
        };

        await _usersRepository.AddAsync(newUser);
        await _usersRepository.SaveChangesAsync();
    }


    public async Task<(string AccessToken, string RefreshToken)> LoginAsync(string email, string password)
    {
        if (email == string.Empty || password == string.Empty)
            throw new InvalidCredentialsException();

        var user = await _usersRepository.GetByEmailAsync(email);
        if (user == null)
            throw new InvalidCredentialsException();

        if (BCrypt.Net.BCrypt.Verify(password, user.PasswordHash) == false)
            throw new InvalidCredentialsException();

        string accessToken = GenerateAccessToken(user);
        string refresh = GenerateRefreshToken();
        string refreshTokenHash = ComputeHash(refresh);

        var refreshToken = new RefreshToken
        {
            TokenHash = refreshTokenHash,
            Created = DateTime.UtcNow,
            UserId = user.Id,
            Revoked = null,
            Expires = DateTime.UtcNow.AddDays(7),
        };

        await _refreshTokensRepository.AddAsync(refreshToken);
        await _refreshTokensRepository.SaveChangesAsync();

        return (accessToken, refresh);
    }


    public async Task LogoutAsync(string refresh)
    {
        var refreshTokenHash = ComputeHash(refresh);
        var refreshToken = await _refreshTokensRepository.GetByHashAsync(refreshTokenHash);

        if (refreshToken == null)
            throw new NotFoundException("Refresh token not found");

        refreshToken.Revoked = DateTime.UtcNow;
        await _refreshTokensRepository.SaveChangesAsync();
    }


    public async Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(string refresh)
    {
        var refreshTokenHash = ComputeHash(refresh);
        var refreshToken = await _refreshTokensRepository.GetByHashAsync(refreshTokenHash);
        if (refreshToken == null)
            throw new NotFoundException("Refresh token not found");

        var user = await _usersRepository.GetByIdAsync(refreshToken.UserId);
        if (user == null)
            throw new NotFoundException("User not found");

        if (refreshToken.Revoked != null)
            throw new InvalidRefreshTokenException("Refresh token is revoked");

        if (refreshToken.Expires < DateTime.UtcNow)
            throw new InvalidRefreshTokenException("Refresh token is expired");

        string newAccessToken = GenerateAccessToken(user);


        await _refreshTokensRepository.RemoveAsync(refreshToken);

        string newRefresh = GenerateRefreshToken();
        string newRefreshTokenHash = ComputeHash(newRefresh);

        var newRefreshToken = new RefreshToken
        {
            TokenHash = newRefreshTokenHash,
            Created = DateTime.UtcNow,
            UserId = refreshToken.UserId,
            Revoked = null,
            Expires = DateTime.UtcNow.AddDays(7),
        };

        await _refreshTokensRepository.AddAsync(newRefreshToken);
        await _refreshTokensRepository.SaveChangesAsync();

        return (newAccessToken, newRefresh);
    }


    private string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FirstName)
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    
    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }
    
    
    private static string ComputeHash(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToBase64String(bytes);
    }
}
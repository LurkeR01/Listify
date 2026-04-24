using CloudinaryDotNet;
using Microsoft.Extensions.Configuration;

namespace Listify.Application.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var account = new Account(
            configuration["Cloudinary:Cloud_Name"],
            configuration["Cloudinary:Api_Key"],
            configuration["Cloudinary:Api_Secret"]
        );
        
        _cloudinary = new Cloudinary(account);
    }

    public object GenerateSignature()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var parameters = new SortedDictionary<string, object>
        {
            { "timestamp", timestamp }
        };

        var signature = _cloudinary.Api.SignParameters(parameters);

        return new
        {
            timestamp,
            signature,
            apiKey = _cloudinary.Api.Account.ApiKey,
            cloudName = _cloudinary.Api.Account.Cloud
        };
    }
}
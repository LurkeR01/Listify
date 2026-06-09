using CloudinaryDotNet;
using Listify.Application.Common.Options;
using Microsoft.Extensions.Options;

namespace Listify.Application.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IOptions<CloudinaryOptions> cloudinaryOptions)
    {
        var options = cloudinaryOptions.Value;
        var account = new Account(
            options.CloudName,
            options.ApiKey,
            options.ApiSecret
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

using Microsoft.Extensions.Configuration;

namespace Listify.Application.Common.Options;

public class CloudinaryOptions
{
    public const string SectionName = "Cloudinary";

    [ConfigurationKeyName("Cloud_Name")]
    public string CloudName { get; init; } = string.Empty;

    [ConfigurationKeyName("Api_Key")]
    public string ApiKey { get; init; } = string.Empty;

    [ConfigurationKeyName("Api_Secret")]
    public string ApiSecret { get; init; } = string.Empty;
}

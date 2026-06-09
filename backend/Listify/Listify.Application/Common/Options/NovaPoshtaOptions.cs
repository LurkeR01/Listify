using Microsoft.Extensions.Configuration;

namespace Listify.Application.Common.Options;

public class NovaPoshtaOptions
{
    public const string SectionName = "NovaPoshta";

    [ConfigurationKeyName("Api_Key")]
    public string ApiKey { get; init; } = string.Empty;
}

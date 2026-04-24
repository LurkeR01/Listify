using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Listify.Application.DTOs;
using Microsoft.Extensions.Configuration;

namespace Listify.Application.Services;

public class LocationService
{
    private const string NovaPoshtaClientName = "NovaPoshta";

    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public LocationService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<List<LocationDto>> SearchCities(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return [];

        var apiKey = _configuration["NOVAPOSHTA:Api_Key"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return [];

        var client = _httpClientFactory.CreateClient(NovaPoshtaClientName);

        var request = new
        {
            apiKey,
            modelName = "AddressGeneral",
            calledMethod = "searchSettlements",
            methodProperties = new
            {
                CityName = query,
                Limit = "5",
                Page = "1"
            }
        };
        
        var options = new JsonSerializerOptions
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        var json = JsonSerializer.Serialize(request, options);
        
        var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json"
        );
        
        using var response = await client.PostAsync(
            "v2.0/json/",
            content,
            cancellationToken
        );

        var result = await response.Content.ReadFromJsonAsync<NovaPoshtaResponse>(
            cancellationToken: cancellationToken
        );
        
        if (result is null || result.Success == false || result.Data is null)
            return [];

        return result.Data
            .Where(d => d.Addresses is not null)
            .SelectMany(d => d.Addresses)
            .Select(a => new LocationDto
            {
                Name = a.MainDescription,
                Ref = a.Ref,
                Area = a.Area,
            })
            .ToList();
    }
}


using System.Text.Json.Serialization;
using Azure.Core.Pipeline;
using Listify.Domain;
using Listify.Domain.Enums;

namespace Listify.Application.DTOs;

public class ResponseListingPreviewDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public decimal Price  { get; set; }
    public int? CategoryId { get; set; }
    public LocationDto Location { get; set; }
    public ListingStatus? Status { get; set; }
    public string? ImageUrl { get; set; }
}
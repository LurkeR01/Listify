namespace Listify.Application.DTOs;

public class NovaPoshtaResponse
{
    public bool Success { get; set; }
    public List<NovaPoshtaData> Data { get; set; }
    public List<object> Errors { get; set; }
    public List<object> Warnings { get; set; }
    public List<object> Info { get; set; }
}

public class NovaPoshtaData
{
    public int TotalCount { get; set; }
    public List<NovaPoshtaAddress> Addresses { get; set; }
}

public class NovaPoshtaAddress
{
    public string Present { get; set; }
    public string MainDescription { get; set; } 
    public string Area { get; set; }
    public string Ref { get; set; }
    public string Region { get; set; }
    public string SettlementTypeCode { get; set; }
}
namespace Listify.Domain.Entities;

public class Location
{
    private Location() { }
    
    public string Name { get; private set; }
    public string Ref { get; private set; }
    public string Area { get; private set; }

    public static Location Create(string name, string _ref, string area)
    {
        return new Location()
        {
            Name = name,
            Ref = _ref,
            Area = area,
        };
    }
    
    public void Update(string name, string _ref, string area)
    {
        Name = name;
        Ref = _ref;
        Area = area;
    }
}
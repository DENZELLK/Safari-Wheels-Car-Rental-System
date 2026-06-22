using System.Text.Json;

namespace SafariWheels.API.Models
{
    public class Location
    {
        public int Id { get; set; }

        public string Province { get; set; }

        public string CitiesJson { get; set; }

        public string Address { get; set; }

        public string Phone { get; set; }

        public string Hours { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public bool IsActive { get; set; } = true;

        public List<string> CitiesList
        {
            get => string.IsNullOrEmpty(CitiesJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(CitiesJson);
            set => CitiesJson = JsonSerializer.Serialize(value);
        }
    }
}

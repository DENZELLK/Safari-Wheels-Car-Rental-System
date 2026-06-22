using System.ComponentModel.DataAnnotations;

namespace SafariWheels.API.DTOs
{
    // Coordinates DTO
    public class CoordinatesDto
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    // For creating a new location
    public class CreateLocationDto
    {
        [Required]
        public string Province { get; set; } = string.Empty;

        [Required]
        public List<string> Cities { get; set; } = new List<string>();

        [Required]
        public string Address { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Hours { get; set; } = string.Empty;

        public CoordinatesDto Coordinates { get; set; } = new CoordinatesDto();

        public bool IsActive { get; set; } = true;
    }

    // For updating a location
    public class UpdateLocationDto
    {
        public string? Province { get; set; }
        public List<string>? Cities { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Hours { get; set; }
        public CoordinatesDto? Coordinates { get; set; }
        public bool IsActive { get; set; }
    }

    // For returning location data
    public class LocationResponseDto
    {
        public int Id { get; set; }
        public string Province { get; set; } = string.Empty;
        public List<string> Cities { get; set; } = new List<string>();
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Hours { get; set; } = string.Empty;
        public CoordinatesDto Coordinates { get; set; } = new CoordinatesDto();
        public bool IsActive { get; set; }
    }
}

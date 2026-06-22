using System.ComponentModel.DataAnnotations;

namespace SafariWheels.API.DTOs
{
    public class CreateCarDto
    {
        [Required]
        [MaxLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [Range(1900, 2100)]
        public int Year { get; set; }

        [MaxLength(50)]
        public string? CarType { get; set; }

        [Required]
        [Range(0, 10000)]
        public decimal PricePerDay { get; set; }

        [Range(0, 1000)]
        public decimal PricePerHour { get; set; }

        [Range(0, 50000)]
        public decimal PricePerWeek { get; set; }

        [Range(0, 1000000)]
        public int Mileage { get; set; }

        [MaxLength(50)]
        public string? Engine { get; set; }

        [MaxLength(50)]
        public string? Province { get; set; }

        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        public List<IFormFile>? Images { get; set; }
    }
}
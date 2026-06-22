namespace SafariWheels.API.DTOs
{
    public class CarResponseDto
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string? CarType { get; set; }
        public decimal PricePerDay { get; set; }
        public decimal PricePerHour { get; set; }
        public decimal PricePerWeek { get; set; }
        public int Mileage { get; set; }
        public string? Engine { get; set; }
        public string? Province { get; set; }
        public string? Description { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
        public bool IsAvailable { get; set; }
        public decimal AverageRating { get; set; }
    }
}

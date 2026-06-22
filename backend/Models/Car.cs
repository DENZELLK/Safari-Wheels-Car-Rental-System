// Models/Car.cs
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace SafariWheels.API.Models
{
    public class Car
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        public int Year { get; set; }

        [MaxLength(50)]
        public string? CarType { get; set; }

        public decimal PricePerDay { get; set; }

        public decimal PricePerHour { get; set; }

        public decimal PricePerWeek { get; set; }

        public int Mileage { get; set; }

        [MaxLength(50)]
        public string? Engine { get; set; }

        [MaxLength(50)]
        public string? Province { get; set; }

        public string? Description { get; set; }

        public string? ImageUrls { get; set; } // JSON string

        public bool IsAvailable { get; set; } = true;

        public decimal AverageRating { get; set; } = 0;

        // Relationship
        public virtual ICollection<Rental> Rentals { get; set; } = new List<Rental>();

        // Helper methods to handle image URLs
        public List<string> GetImageUrls()
        {
            if (string.IsNullOrEmpty(ImageUrls))
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(ImageUrls) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        public void SetImageUrls(List<string> urls)
        {
            ImageUrls = JsonSerializer.Serialize(urls);
        }

        public void AddImageUrl(string url)
        {
            var urls = GetImageUrls();
            urls.Add(url);
            SetImageUrls(urls);
        }

        public void RemoveImageUrl(string url)
        {
            var urls = GetImageUrls();
            urls.Remove(url);
            SetImageUrls(urls);
        }

        public void ClearImageUrls()
        {
            ImageUrls = null;
        }

        public bool HasImages()
        {
            return !string.IsNullOrEmpty(ImageUrls) && GetImageUrls().Count > 0;
        }

        public string? GetFirstImageUrl()
        {
            var urls = GetImageUrls();
            return urls.Count > 0 ? urls[0] : null;
        }
    }
}
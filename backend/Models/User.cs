// Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace SafariWheels.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [Required]
        [MaxLength(20)]
        public string DriverLicenseNumber { get; set; } = string.Empty;

        [NotMapped]
        public string Password { get { return ""; } set { PasswordHash = HashPassword(value); } }

        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Address { get; set; }

        public string Role { get; set; } = "Customer"; // Default to Customer

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }

        // Relationships
        public virtual ICollection<Rental> Rentals { get; set; } = new List<Rental>();

        // NEW: Messages relationship - user can have many messages
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

        private static string HashPassword(string password)
        {
            // Simple hash for demo; in production, use BCrypt or Identity
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(password + "salt"));
        }

        public bool VerifyPassword(string password)
        {
            return HashPassword(password) == PasswordHash;
        }
    }
}
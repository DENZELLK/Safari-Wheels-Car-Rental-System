// Models/Rental.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafariWheels.API.Models
{
    public class Rental
    {
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public virtual User User { get; set; } = null!;

        [ForeignKey("Car")]
        public int CarId { get; set; }

        public virtual Car Car { get; set; } = null!;

        // When the rental record was created (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime PickupDate { get; set; }

        public DateTime ReturnDate { get; set; }

        [MaxLength(100)]
        public string? PickupLocation { get; set; }

        [MaxLength(100)]
        public string? DropoffLocation { get; set; }

        public decimal TotalAmount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Completed
    }
}
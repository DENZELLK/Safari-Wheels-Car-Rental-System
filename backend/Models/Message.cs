using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafariWheels.API.Models
{
    public class Message
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(200)]
        public string Subject { get; set; }

        [Required]
        public string MessageText { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }

        // Foreign key to User (nullable for anonymous contact form messages)
        public int? UserId { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        // Collection of replies
        public virtual ICollection<MessageReply> Replies { get; set; }
    }

    public class MessageReply
    {
        public int Id { get; set; }

        [Required]
        public int MessageId { get; set; }

        [Required]
        public string ReplyText { get; set; }

        [StringLength(100)]
        public string RepliedBy { get; set; }

        public DateTime CreatedAt { get; set; }

        // Flag to distinguish between admin and user replies
        public bool IsFromAdmin { get; set; }

        // Navigation property
        [ForeignKey("MessageId")]
        public virtual Message Message { get; set; }
    }
}
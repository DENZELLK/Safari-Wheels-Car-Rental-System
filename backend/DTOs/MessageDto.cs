using System.ComponentModel.DataAnnotations;

namespace SafariWheels.API.DTOs
{
    // For receiving messages from contact form (public)
    public class CreateMessageDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;
    }

    // NEW: For authenticated users sending messages
    public class CreateUserMessageDto
    {
        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;
    }

    // For admin replies
    public class ReplyMessageDto
    {
        [Required]
        public int MessageId { get; set; }

        [Required]
        public string Reply { get; set; } = string.Empty;
    }

    // NEW: For user replies
    public class UserReplyDto
    {
        [Required]
        public int MessageId { get; set; }

        [Required]
        public string Reply { get; set; } = string.Empty;
    }

    // For returning message data (enhanced)
    public class MessageResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        // NEW: Link to user if authenticated
        public int? UserId { get; set; }

        public List<MessageReplyDto> Replies { get; set; } = new List<MessageReplyDto>();
    }

    // For returning user's messages (simplified for profile page)
    public class UserMessageResponseDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<MessageReplyDto> Replies { get; set; } = new List<MessageReplyDto>();
    }

    // Enhanced MessageReplyDto with IsFromAdmin
    public class MessageReplyDto
    {
        public int Id { get; set; }
        public string Reply { get; set; } = string.Empty;
        public string RepliedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // NEW: Flag to distinguish admin vs user replies
        public bool IsFromAdmin { get; set; }
    }

    // For conversation view (full thread)
    public class ConversationItemDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsFromUser { get; set; }
        public string Sender { get; set; } = string.Empty;
    }

    // For unread count
    public class UnreadCountDto
    {
        public int UnreadCount { get; set; }
    }
}
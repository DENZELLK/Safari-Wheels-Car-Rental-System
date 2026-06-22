using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Data;
using SafariWheels.API.DTOs;
using SafariWheels.API.Models;
using System.Security.Claims;
using MessageModel = SafariWheels.API.Models.Message;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==================== ADMIN ENDPOINTS ====================

        // GET: api/messages (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<MessageResponseDto>>> GetAllMessages()
        {
            var messages = await _context.Messages
                .Include(m => m.Replies)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new MessageResponseDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Email = m.Email,
                    Subject = m.Subject ?? string.Empty,
                    Message = m.MessageText,
                    IsRead = m.IsRead,
                    CreatedAt = m.CreatedAt,
                    UserId = m.UserId,
                    Replies = m.Replies.Select(r => new MessageReplyDto
                    {
                        Id = r.Id,
                        Reply = r.ReplyText,
                        CreatedAt = r.CreatedAt,
                        RepliedBy = r.RepliedBy ?? "Admin",
                        IsFromAdmin = r.IsFromAdmin
                    }).ToList()
                })
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/messages/unread/count (Admin only)
        [HttpGet("unread/count")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UnreadCountDto>> GetUnreadCount()
        {
            var count = await _context.Messages.CountAsync(m => !m.IsRead);
            return Ok(new UnreadCountDto { UnreadCount = count });
        }

        // GET: api/messages/{id} (Admin only)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MessageResponseDto>> GetMessage(int id)
        {
            var message = await _context.Messages
                .Include(m => m.Replies)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (message == null)
                return NotFound();

            var response = new MessageResponseDto
            {
                Id = message.Id,
                Name = message.Name,
                Email = message.Email,
                Subject = message.Subject ?? string.Empty,
                Message = message.MessageText,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt,
                UserId = message.UserId,
                Replies = message.Replies.Select(r => new MessageReplyDto
                {
                    Id = r.Id,
                    Reply = r.ReplyText,
                    CreatedAt = r.CreatedAt,
                    RepliedBy = r.RepliedBy ?? "Admin",
                    IsFromAdmin = r.IsFromAdmin
                }).ToList()
            };

            return Ok(response);
        }

        // PUT: api/messages/{id}/read (Admin only)
        [HttpPut("{id}/read")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();

            message.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Message marked as read" });
        }

        // POST: api/messages/reply (Admin only)
        [HttpPost("reply")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReplyToMessage([FromBody] ReplyMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var message = await _context.Messages.FindAsync(dto.MessageId);
            if (message == null)
                return NotFound("Message not found");

            var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";

            var reply = new MessageReply
            {
                MessageId = dto.MessageId,
                ReplyText = dto.Reply,
                RepliedBy = adminEmail,
                CreatedAt = DateTime.UtcNow,
                IsFromAdmin = true
            };

            _context.MessageReplies.Add(reply);

            // Mark original message as read if it wasn't
            if (!message.IsRead)
                message.IsRead = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = reply.Id,
                message = "Reply sent successfully"
            });
        }

        // DELETE: api/messages/{id} (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _context.Messages
                .Include(m => m.Replies)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (message == null)
                return NotFound();

            _context.MessageReplies.RemoveRange(message.Replies);
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Message deleted successfully" });
        }

        // ==================== PUBLIC ENDPOINT ====================

        // POST: api/messages/contact (Public - for contact form)
        [HttpPost("contact")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateContactMessage([FromBody] CreateMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var message = new MessageModel
            {
                Name = dto.Name,
                Email = dto.Email,
                Subject = dto.Subject,
                MessageText = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                UserId = null // No user associated for anonymous contact
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = message.Id,
                message = "Message sent successfully"
            });
        }

        // ==================== USER ENDPOINTS ====================

        // Helper method to get current user ID
        private async Task<int?> GetCurrentUserId()
        {
            // Try to get user ID from NameIdentifier claim
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            // Fallback to email lookup
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (!string.IsNullOrEmpty(email))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                return user?.Id;
            }

            return null;
        }

        // GET: api/messages/my-messages (Authenticated users only)
        [HttpGet("my-messages")]
        [Authorize]
        public async Task<ActionResult<List<UserMessageResponseDto>>> GetMyMessages()
        {
            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var messages = await _context.Messages
                .Where(m => m.UserId == userId)
                .Include(m => m.Replies)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new UserMessageResponseDto
                {
                    Id = m.Id,
                    Subject = m.Subject ?? string.Empty,
                    Message = m.MessageText,
                    IsRead = m.IsRead,
                    CreatedAt = m.CreatedAt,
                    Replies = m.Replies.Select(r => new MessageReplyDto
                    {
                        Id = r.Id,
                        Reply = r.ReplyText,
                        CreatedAt = r.CreatedAt,
                        RepliedBy = r.RepliedBy ?? "Admin",
                        IsFromAdmin = r.IsFromAdmin
                    }).OrderBy(r => r.CreatedAt).ToList()
                })
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/messages/my-messages/unread-count (Authenticated users only)
        [HttpGet("my-messages/unread-count")]
        [Authorize]
        public async Task<ActionResult<UnreadCountDto>> GetMyUnreadCount()
        {
            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var count = await _context.Messages
                .Where(m => m.UserId == userId && !m.IsRead)
                .CountAsync();

            return Ok(new UnreadCountDto { UnreadCount = count });
        }

        // POST: api/messages/user-message (Authenticated users only)
        [HttpPost("user-message")]
        [Authorize]
        public async Task<IActionResult> CreateUserMessage([FromBody] CreateUserMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            var message = new MessageModel
            {
                Name = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                Subject = dto.Subject,
                MessageText = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = message.Id,
                message = "Message sent successfully"
            });
        }

        // POST: api/messages/user-reply (Authenticated users only)
        [HttpPost("user-reply")]
        [Authorize]
        public async Task<IActionResult> ReplyAsUser([FromBody] UserReplyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            // Verify the message belongs to this user
            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.Id == dto.MessageId && m.UserId == userId);

            if (message == null)
                return NotFound("Message not found or you don't have permission to reply");

            var reply = new MessageReply
            {
                MessageId = dto.MessageId,
                ReplyText = dto.Reply,
                RepliedBy = "Customer",
                CreatedAt = DateTime.UtcNow,
                IsFromAdmin = false
            };

            _context.MessageReplies.Add(reply);

            // When user replies, mark message as unread for admin
            message.IsRead = false;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = reply.Id,
                message = "Reply sent successfully"
            });
        }

        // GET: api/messages/conversation/{messageId} (Authenticated users only)
        [HttpGet("conversation/{messageId}")]
        [Authorize]
        public async Task<ActionResult<List<ConversationItemDto>>> GetConversation(int messageId)
        {
            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var message = await _context.Messages
                .Where(m => m.Id == messageId && m.UserId == userId)
                .Include(m => m.Replies)
                .FirstOrDefaultAsync();

            if (message == null)
                return NotFound();

            // Group all messages in this conversation (original + replies)
            var conversation = new List<ConversationItemDto>();

            // Add original message
            conversation.Add(new ConversationItemDto
            {
                Id = message.Id,
                Text = message.MessageText,
                CreatedAt = message.CreatedAt,
                IsFromUser = true,
                Sender = "You"
            });

            // Add replies
            foreach (var reply in message.Replies.OrderBy(r => r.CreatedAt))
            {
                conversation.Add(new ConversationItemDto
                {
                    Id = reply.Id,
                    Text = reply.ReplyText,
                    CreatedAt = reply.CreatedAt,
                    IsFromUser = !reply.IsFromAdmin,
                    Sender = reply.IsFromAdmin ? "Admin" : "You"
                });
            }

            return Ok(conversation);
        }
    }
}
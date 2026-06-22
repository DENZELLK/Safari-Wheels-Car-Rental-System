using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SafariWheels.API.Data;
using SafariWheels.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        [HttpPost("/api/register")] // Multiple routing
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Duplicate check logic
            if (_context.Users.Any(u => u.Email.ToLower() == user.Email.ToLower()))
                return BadRequest(new { message = "Email already exists." });

            user.Role = "Customer"; // Default role

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate token and return same structure as login
            var token = GenerateJwtToken(user);

            // Return user without password hash for security
            var userResponse = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                user.DriverLicenseNumber,
                user.Address,
                user.Role
            };

            return Ok(new { token, user = userResponse });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null || !user.VerifyPassword(loginDto.Password))
                return Unauthorized(new { message = "Invalid credentials." });

            var token = GenerateJwtToken(user);

            // Return user without password hash for security
            var userResponse = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                user.DriverLicenseNumber,
                user.Address,
                user.Role
            };

            return Ok(new { token, user = userResponse });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var emailClaim = HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim);

            if (user == null) return NotFound();

            // Return user without password hash for security
            var userResponse = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                user.DriverLicenseNumber,
                user.Address,
                user.Role
            };

            return Ok(userResponse);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] User updatedUser)
        {
            var emailClaim = HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim);

            if (user == null) return NotFound();

            // Update properties (exclude Id, Email, Password)
            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.PhoneNumber = updatedUser.PhoneNumber;
            user.Address = updatedUser.Address;

            await _context.SaveChangesAsync();

            // Return updated user without password hash
            var userResponse = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                user.DriverLicenseNumber,
                user.Address,
                user.Role
            };

            return Ok(userResponse);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "default-secret-key-min-32-chars-long"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
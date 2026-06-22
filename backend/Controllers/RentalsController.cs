using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Data;
using SafariWheels.API.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RentalsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RentalsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-rentals")]
        [Authorize]
        public async Task<IActionResult> GetUserRentals()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var rentals = await _context.Rentals
                .Include(r => r.Car)
                .Where(r => r.UserId == userId)
                .ToListAsync();

            return Ok(rentals);
        }

        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")] // Tells Swagger to expect a file
        public async Task<IActionResult> Create([FromForm] CreateRentalForm request)
        {
            if (request.PickupDate >= request.ReturnDate)
                return BadRequest(new { error = "Return date must be after pickup date" });

            var car = await _context.Cars.FindAsync(request.CarId);
            if (car == null || !car.IsAvailable)
                return BadRequest(new { error = "Car is not available" });

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var rental = new Rental
            {
                UserId = userId,
                CarId = request.CarId,
                PickupDate = request.PickupDate,
                ReturnDate = request.ReturnDate,
                PickupLocation = request.PickupLocation,
                DropoffLocation = request.DropoffLocation,
                TotalAmount = request.TotalAmount,
                Status = "Pending"
            };

            if (request.ProofOfAddress != null && request.ProofOfAddress.Length > 0)
            {
                var uploadsFolder = Path.Combine("wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, Guid.NewGuid() + Path.GetExtension(request.ProofOfAddress.FileName));
                using var stream = new FileStream(filePath, FileMode.Create);
                await request.ProofOfAddress.CopyToAsync(stream);

                // Optional: store file path in rental
                // rental.ProofOfAddressPath = filePath;
            }

            _context.Rentals.Add(rental);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = rental.Id }, rental);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rental = await _context.Rentals
                .Include(r => r.User)
                .Include(r => r.Car)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rental == null) return NotFound();

            return Ok(rental);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int id)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null) return NotFound();

            rental.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(rental);
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reject(int id)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null) return NotFound();

            rental.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(rental);
        }

        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Complete(int id)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null) return NotFound();

            rental.Status = "Completed";
            await _context.SaveChangesAsync();

            return Ok(rental);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var rentals = await _context.Rentals
                .Include(r => r.User)
                .Include(r => r.Car)
                .ToListAsync();

            return Ok(rentals);
        }
    }

    public class CreateRentalDto
    {
        public int CarId { get; set; }
        public DateTime PickupDate { get; set; }
        public DateTime ReturnDate { get; set; }
        public string? PickupLocation { get; set; }
        public string? DropoffLocation { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
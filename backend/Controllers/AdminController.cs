using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Data;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new
            {
                totalUsers = await _context.Users.CountAsync(),
                totalCars = await _context.Cars.CountAsync(),
                totalRentals = await _context.Rentals.CountAsync(),
                pendingApprovals = await _context.Rentals.CountAsync(r => r.Status == "Pending")
            };

            return Ok(stats);
        }

        [HttpGet("pending-rentals")]
        public async Task<IActionResult> GetPendingRentals()
        {
            var rentals = await _context.Rentals
                .Include(r => r.User)
                .Include(r => r.Car)
                .Where(r => r.Status == "Pending")
                .Select(r => new
                {
                    id = r.Id,
                    pickupDate = r.PickupDate.ToString("yyyy-MM-dd"),
                    returnDate = r.ReturnDate.ToString("yyyy-MM-dd"),
                    totalAmount = r.TotalAmount,
                    status = r.Status,
                    pickupLocation = r.PickupLocation,
                    dropoffLocation = r.DropoffLocation,
                    user = new
                    {
                        id = r.User.Id,
                        firstName = r.User.FirstName,
                        lastName = r.User.LastName,
                        email = r.User.Email
                    },
                    car = new
                    {
                        id = r.Car.Id,
                        make = r.Car.Make,
                        model = r.Car.Model,
                        year = r.Car.Year,
                        carType = r.Car.CarType,
                        pricePerDay = r.Car.PricePerDay,
                        pricePerHour = r.Car.PricePerHour,
                        pricePerWeek = r.Car.PricePerWeek,
                        imageUrls = r.Car.GetImageUrls()
                    }
                })
                .ToListAsync();

            return Ok(rentals);
        }

        [HttpGet("all-rentals")]
        public async Task<IActionResult> GetAllRentals()
        {
            var rentals = await _context.Rentals
                .Include(r => r.User)
                .Include(r => r.Car)
                .Select(r => new
                {
                    id = r.Id,
                    pickupDate = r.PickupDate.ToString("yyyy-MM-dd"),
                    returnDate = r.ReturnDate.ToString("yyyy-MM-dd"),
                    totalAmount = r.TotalAmount,
                    status = r.Status,
                    pickupLocation = r.PickupLocation,
                    dropoffLocation = r.DropoffLocation,
                    user = new
                    {
                        id = r.User.Id,
                        firstName = r.User.FirstName,
                        lastName = r.User.LastName,
                        email = r.User.Email
                    },
                    car = new
                    {
                        id = r.Car.Id,
                        make = r.Car.Make,
                        model = r.Car.Model,
                        year = r.Car.Year,
                        carType = r.Car.CarType,
                        pricePerDay = r.Car.PricePerDay,
                        pricePerHour = r.Car.PricePerHour,
                        pricePerWeek = r.Car.PricePerWeek,
                        imageUrls = r.Car.GetImageUrls()
                    }
                })
                .ToListAsync();

            return Ok(rentals);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    phoneNumber = u.PhoneNumber,
                    role = u.Role,
                    driverLicenseNumber = u.DriverLicenseNumber,
                    address = u.Address
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("cars")]
        public async Task<IActionResult> GetCars()
        {
            var cars = await _context.Cars
                .Select(c => new
                {
                    id = c.Id,
                    make = c.Make,
                    model = c.Model,
                    year = c.Year,
                    carType = c.CarType,
                    pricePerDay = c.PricePerDay,
                    pricePerHour = c.PricePerHour,
                    pricePerWeek = c.PricePerWeek,
                    mileage = c.Mileage,
                    engine = c.Engine,
                    province = c.Province,
                    description = c.Description,
                    imageUrls = c.GetImageUrls(),
                    isAvailable = c.IsAvailable,
                    averageRating = c.AverageRating
                })
                .ToListAsync();

            return Ok(cars);
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Data;
using SafariWheels.API.DTOs;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/analytics/dashboard-summary
        [HttpGet("dashboard-summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);

            var totalRevenue = await _context.Rentals
                .Where(r => r.Status == "Completed" || r.Status == "Approved")
                .SumAsync(r => r.TotalAmount);

            var monthlyRevenue = await _context.Rentals
                .Where(r => (r.Status == "Completed" || r.Status == "Approved") &&
                            r.CreatedAt >= startOfMonth)
                .SumAsync(r => r.TotalAmount);

            var lastMonthRevenue = await _context.Rentals
                .Where(r => (r.Status == "Completed" || r.Status == "Approved") &&
                            r.CreatedAt >= startOfLastMonth &&
                            r.CreatedAt < startOfMonth)
                .SumAsync(r => r.TotalAmount);

            var totalBookings = await _context.Rentals.CountAsync();
            var monthlyBookings = await _context.Rentals
                .CountAsync(r => r.CreatedAt >= startOfMonth);
            var lastMonthBookings = await _context.Rentals
                .CountAsync(r => r.CreatedAt >= startOfLastMonth && r.CreatedAt < startOfMonth);

            var unreadMessages = await _context.Messages.CountAsync(m => !m.IsRead);

            // Calculate active users (users who made a booking in the last 30 days)
            var activeUsers = await _context.Rentals
                .Where(r => r.CreatedAt >= now.AddDays(-30))
                .Select(r => r.UserId)
                .Distinct()
                .CountAsync();

            var dashboardSummary = new DashboardSummaryDto
            {
                TotalRevenue = totalRevenue,
                MonthlyRevenue = monthlyRevenue,
                RevenueGrowth = lastMonthRevenue > 0
                    ? ((double)((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
                    : 0,
                TotalBookings = totalBookings,
                MonthlyBookings = monthlyBookings,
                BookingsGrowth = lastMonthBookings > 0
                    ? ((double)(monthlyBookings - lastMonthBookings) / lastMonthBookings) * 100
                    : 0,
                ActiveUsers = activeUsers,
                UnreadMessages = unreadMessages,
                TotalUsers = await _context.Users.CountAsync(),
                TotalCars = await _context.Cars.CountAsync(),
                PendingApprovals = await _context.Rentals.CountAsync(r => r.Status == "Pending")
            };

            return Ok(dashboardSummary);
        }

        // GET: api/analytics/revenue
        [HttpGet("revenue")]
        public async Task<ActionResult<List<ChartDataPointDto>>> GetRevenue([FromQuery] string period = "month")
        {
            var data = new List<ChartDataPointDto>();
            var now = DateTime.UtcNow;

            switch (period.ToLower())
            {
                case "week":
                    for (int i = 6; i >= 0; i--)
                    {
                        var date = now.AddDays(-i).Date;
                        var nextDate = date.AddDays(1);

                        var revenue = await _context.Rentals
                            .Where(r => (r.Status == "Completed" || r.Status == "Approved") &&
                                        r.CreatedAt >= date && r.CreatedAt < nextDate)
                            .SumAsync(r => r.TotalAmount);

                        data.Add(new ChartDataPointDto
                        {
                            Name = date.ToString("ddd"),
                            Revenue = revenue
                        });
                    }
                    break;

                case "month":
                    var daysInMonth = DateTime.DaysInMonth(now.Year, now.Month);
                    for (int i = 1; i <= daysInMonth; i++)
                    {
                        var date = new DateTime(now.Year, now.Month, i);
                        var nextDate = date.AddDays(1);

                        var revenue = await _context.Rentals
                            .Where(r => (r.Status == "Completed" || r.Status == "Approved") &&
                                        r.CreatedAt >= date && r.CreatedAt < nextDate)
                            .SumAsync(r => r.TotalAmount);

                        data.Add(new ChartDataPointDto
                        {
                            Name = i.ToString(),
                            Revenue = revenue
                        });
                    }
                    break;

                case "year":
                    for (int i = 1; i <= 12; i++)
                    {
                        var startDate = new DateTime(now.Year, i, 1);
                        var endDate = startDate.AddMonths(1);

                        var revenue = await _context.Rentals
                            .Where(r => (r.Status == "Completed" || r.Status == "Approved") &&
                                        r.CreatedAt >= startDate && r.CreatedAt < endDate)
                            .SumAsync(r => r.TotalAmount);

                        data.Add(new ChartDataPointDto
                        {
                            Name = startDate.ToString("MMM"),
                            Revenue = revenue
                        });
                    }
                    break;
            }

            return Ok(data);
        }

        // GET: api/analytics/bookings
        [HttpGet("bookings")]
        public async Task<ActionResult<List<ChartDataPointDto>>> GetBookings([FromQuery] string period = "month")
        {
            var data = new List<ChartDataPointDto>();
            var now = DateTime.UtcNow;

            switch (period.ToLower())
            {
                case "week":
                    for (int i = 6; i >= 0; i--)
                    {
                        var date = now.AddDays(-i).Date;
                        var nextDate = date.AddDays(1);

                        var count = await _context.Rentals
                            .CountAsync(r => r.CreatedAt >= date && r.CreatedAt < nextDate);

                        data.Add(new ChartDataPointDto
                        {
                            Name = date.ToString("ddd"),
                            Bookings = count
                        });
                    }
                    break;

                case "month":
                    var daysInMonth = DateTime.DaysInMonth(now.Year, now.Month);
                    for (int i = 1; i <= daysInMonth; i++)
                    {
                        var date = new DateTime(now.Year, now.Month, i);
                        var nextDate = date.AddDays(1);

                        var count = await _context.Rentals
                            .CountAsync(r => r.CreatedAt >= date && r.CreatedAt < nextDate);

                        data.Add(new ChartDataPointDto
                        {
                            Name = i.ToString(),
                            Bookings = count
                        });
                    }
                    break;

                case "year":
                    for (int i = 1; i <= 12; i++)
                    {
                        var startDate = new DateTime(now.Year, i, 1);
                        var endDate = startDate.AddMonths(1);

                        var count = await _context.Rentals
                            .CountAsync(r => r.CreatedAt >= startDate && r.CreatedAt < endDate);

                        data.Add(new ChartDataPointDto
                        {
                            Name = startDate.ToString("MMM"),
                            Bookings = count
                        });
                    }
                    break;
            }

            return Ok(data);
        }

        // GET: api/analytics/popular-cars
        [HttpGet("popular-cars")]
        public async Task<ActionResult<List<PopularCarDto>>> GetPopularCars([FromQuery] int limit = 5)
        {
            var popularCars = await _context.Rentals
                .Where(r => r.Status == "Completed" || r.Status == "Approved")
                .GroupBy(r => r.CarId)
                .Select(g => new PopularCarDto
                {
                    CarId = g.Key,
                    Make = g.First().Car.Make,
                    Model = g.First().Car.Model,
                    Bookings = g.Count(),
                    Revenue = g.Sum(r => r.TotalAmount)
                })
                .OrderByDescending(x => x.Bookings)
                .Take(limit)
                .ToListAsync();

            return Ok(popularCars);
        }

        // GET: api/analytics/popular-locations
        [HttpGet("popular-locations")]
        public async Task<ActionResult<List<PopularLocationDto>>> GetPopularLocations([FromQuery] int limit = 5)
        {
            var popularLocations = await _context.Rentals
                .Where(r => r.Status == "Completed" || r.Status == "Approved")
                .GroupBy(r => r.PickupLocation)
                .Select(g => new PopularLocationDto
                {
                    Location = g.Key,
                    Bookings = g.Count()
                })
                .OrderByDescending(x => x.Bookings)
                .Take(limit)
                .ToListAsync();

            return Ok(popularLocations);
        }

        // GET: api/analytics/user-growth
        [HttpGet("user-growth")]
        public async Task<ActionResult<List<UserGrowthDto>>> GetUserGrowth([FromQuery] string period = "month")
        {
            var data = new List<UserGrowthDto>();
            var now = DateTime.UtcNow;

            switch (period.ToLower())
            {
                case "month":
                    var daysInMonth = DateTime.DaysInMonth(now.Year, now.Month);
                    for (int i = 1; i <= daysInMonth; i++)
                    {
                        var date = new DateTime(now.Year, now.Month, i);
                        var nextDate = date.AddDays(1);

                        var count = await _context.Users
                            .CountAsync(u => u.CreatedAt < nextDate);

                        data.Add(new UserGrowthDto
                        {
                            Name = i.ToString(),
                            Users = count
                        });
                    }
                    break;

                case "year":
                    for (int i = 1; i <= 12; i++)
                    {
                        var date = new DateTime(now.Year, i, 1);
                        var nextDate = date.AddMonths(1);

                        var count = await _context.Users
                            .CountAsync(u => u.CreatedAt < nextDate);

                        data.Add(new UserGrowthDto
                        {
                            Name = date.ToString("MMM"),
                            Users = count
                        });
                    }
                    break;
            }

            return Ok(data);
        }

        // GET: api/analytics/car-types
        [HttpGet("car-types")]
        public async Task<ActionResult<List<CarTypeDistributionDto>>> GetCarTypeDistribution()
        {
            var distribution = await _context.Cars
                .GroupBy(c => c.CarType)
                .Select(g => new CarTypeDistributionDto
                {
                    Name = g.Key ?? "Unknown",
                    Value = g.Count()
                })
                .ToListAsync();

            return Ok(distribution);
        }
    }
}

namespace SafariWheels.API.DTOs
{
    // Dashboard Summary DTO
    public class DashboardSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public double RevenueGrowth { get; set; }

        public int TotalBookings { get; set; }
        public int MonthlyBookings { get; set; }
        public double BookingsGrowth { get; set; }

        public int ActiveUsers { get; set; }
        public int TotalUsers { get; set; }
        public int TotalCars { get; set; }
        public int PendingApprovals { get; set; }
        public int UnreadMessages { get; set; }
    }

    // Revenue/Bokings Chart Data Point
    public class ChartDataPointDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Bookings { get; set; }
    }

    // Popular Cars DTO
    public class PopularCarDto
    {
        public int CarId { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Bookings { get; set; }
        public decimal Revenue { get; set; }
    }

    // Popular Locations DTO
    public class PopularLocationDto
    {
        public string Location { get; set; } = string.Empty;
        public int Bookings { get; set; }
    }

    // User Growth Data Point
    public class UserGrowthDto
    {
        public string Name { get; set; } = string.Empty;
        public int Users { get; set; }
    }

    // Car Type Distribution DTO
    public class CarTypeDistributionDto
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
    }
}

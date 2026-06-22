using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Models;
using System.Text;

namespace SafariWheels.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Existing DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<Rental> Rentals { get; set; }

        // DbSets for Admin Features
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageReply> MessageReplies { get; set; }
        public DbSet<ContactInfo> ContactInfos { get; set; }
        public DbSet<Location> Locations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Cars and Rentals
            ConfigureCarEntity(modelBuilder);
            ConfigureRentalEntity(modelBuilder);

            // Configure relationships and indexes
            ConfigureUserRentalRelationships(modelBuilder);
            ConfigureUserIndexes(modelBuilder);

            // Configure Message entities (UPDATED with User relationship)
            ConfigureMessageEntities(modelBuilder);

            // Configure ContactInfo
            ConfigureContactInfo(modelBuilder);

            // Configure Location
            ConfigureLocation(modelBuilder);

            // Seed Data
            SeedAdminUser(modelBuilder);
            SeedSampleCars(modelBuilder);
            SeedDefaultContactInfo(modelBuilder);
            SeedSampleLocations(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

        private void ConfigureCarEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Car>(entity =>
            {
                entity.Property(c => c.PricePerDay).HasPrecision(18, 2);
                entity.Property(c => c.PricePerHour).HasPrecision(18, 2);
                entity.Property(c => c.PricePerWeek).HasPrecision(18, 2);
                entity.Property(c => c.AverageRating).HasPrecision(3, 1);
            });
        }

        private void ConfigureRentalEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Rental>(entity =>
            {
                entity.Property(r => r.TotalAmount).HasPrecision(18, 2);
            });
        }

        private void ConfigureUserRentalRelationships(ModelBuilder modelBuilder)
        {
            // One-to-Many: User to Rentals
            modelBuilder.Entity<Rental>()
                .HasOne(r => r.User)
                .WithMany(u => u.Rentals)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Car to Rentals
            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Car)
                .WithMany(c => c.Rentals)
                .HasForeignKey(r => r.CarId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureUserIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }

        // UPDATED: Configure Message entities with User relationship
        private void ConfigureMessageEntities(ModelBuilder modelBuilder)
        {
            // Message configuration
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(m => m.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(m => m.Subject)
                    .HasMaxLength(200);

                entity.Property(m => m.MessageText)
                    .IsRequired();

                entity.Property(m => m.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                // Foreign key to User (nullable)
                entity.Property(m => m.UserId)
                    .IsRequired(false);

                // Indexes for faster queries
                entity.HasIndex(m => m.IsRead);
                entity.HasIndex(m => m.CreatedAt);
                entity.HasIndex(m => m.UserId); // NEW: Index for user-based queries

                // Relationship with User (NEW)
                entity.HasOne(m => m.User)
                    .WithMany(u => u.Messages)
                    .HasForeignKey(m => m.UserId)
                    .OnDelete(DeleteBehavior.SetNull); // Set UserId to null if user is deleted
            });

            // MessageReply configuration
            modelBuilder.Entity<MessageReply>(entity =>
            {
                entity.HasKey(r => r.Id);

                entity.Property(r => r.ReplyText)
                    .IsRequired();

                entity.Property(r => r.RepliedBy)
                    .HasMaxLength(100);

                entity.Property(r => r.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                // NEW: Add IsFromAdmin property
                entity.Property(r => r.IsFromAdmin)
                    .IsRequired()
                    .HasDefaultValue(false);

                // Index for faster queries
                entity.HasIndex(r => r.MessageId);
                entity.HasIndex(r => r.IsFromAdmin); // NEW: Index for admin/user reply filtering

                // Relationship with Message
                entity.HasOne(r => r.Message)
                    .WithMany(m => m.Replies)
                    .HasForeignKey(r => r.MessageId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private void ConfigureContactInfo(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ContactInfo>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Address).IsRequired();
                entity.Property(c => c.Street).IsRequired();
                entity.Property(c => c.City).IsRequired();
                entity.Property(c => c.Province).IsRequired();
                entity.Property(c => c.PostalCode).IsRequired();
                entity.Property(c => c.Country).IsRequired();
                entity.Property(c => c.PhoneMain).IsRequired();
                entity.Property(c => c.PhoneSupport).IsRequired();
                entity.Property(c => c.EmailInfo).IsRequired();
                entity.Property(c => c.EmailSupport).IsRequired();
                entity.Property(c => c.MondayHours).IsRequired();
                entity.Property(c => c.TuesdayHours).IsRequired();
                entity.Property(c => c.WednesdayHours).IsRequired();
                entity.Property(c => c.ThursdayHours).IsRequired();
                entity.Property(c => c.FridayHours).IsRequired();
                entity.Property(c => c.SaturdayHours).IsRequired();
                entity.Property(c => c.SundayHours).IsRequired();
                entity.Property(c => c.Facebook).IsRequired();
                entity.Property(c => c.Twitter).IsRequired();
                entity.Property(c => c.Instagram).IsRequired();
                entity.Property(c => c.LinkedIn).IsRequired();

                // Ensure only one record exists
                entity.HasIndex(c => c.Id).IsUnique();
            });
        }

        private void ConfigureLocation(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Location>(entity =>
            {
                entity.HasKey(l => l.Id);

                entity.Property(l => l.Province)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(l => l.CitiesJson)
                    .IsRequired();

                entity.Property(l => l.Address)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(l => l.Phone)
                    .HasMaxLength(20);

                entity.Property(l => l.Hours)
                    .HasMaxLength(200);

                // Configure decimal precision for coordinates
                entity.Property(l => l.Latitude)
                    .HasPrecision(10, 6);

                entity.Property(l => l.Longitude)
                    .HasPrecision(10, 6);

                entity.Property(l => l.IsActive)
                    .IsRequired()
                    .HasDefaultValue(true);

                // Indexes for faster province-based queries
                entity.HasIndex(l => l.Province);
                entity.HasIndex(l => l.IsActive);
            });
        }

        private void SeedAdminUser(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = -1,
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@safariwheels.co.za",
                    PhoneNumber = "+27 11 123 4567",
                    DriverLicenseNumber = "ADMIN123",
                    PasswordHash = Convert.ToBase64String(Encoding.UTF8.GetBytes("admin123" + "salt")),
                    Address = "123 Luxury Avenue, Sandton",
                    Role = "Admin",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }

        private void SeedSampleCars(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Car>().HasData(
                new Car { Id = -1, Make = "BMW", Model = "M8 Competition", Year = 2023, CarType = "Sports Car", PricePerDay = 2500, PricePerHour = 200, PricePerWeek = 15000, Mileage = 5000, Engine = "V8 Twin-Turbo", Province = "Gauteng", Description = "Ultimate grand tourer with blistering performance.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.8m },
                new Car { Id = -2, Make = "Mercedes-Benz", Model = "S-Class", Year = 2024, CarType = "Luxury", PricePerDay = 1800, PricePerHour = 150, PricePerWeek = 11000, Mileage = 2000, Engine = "V6 Hybrid", Province = "Western Cape", Description = "Exquisite comfort and advanced tech for executives.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.9m },
                new Car { Id = -3, Make = "Porsche", Model = "911 Turbo S", Year = 2023, CarType = "Sports Car", PricePerDay = 3500, PricePerHour = 300, PricePerWeek = 20000, Mileage = 8000, Engine = "Flat-6 Twin-Turbo", Province = "KwaZulu-Natal", Description = "Iconic supercar with unmatched handling.", ImageUrls = "[]", IsAvailable = false, AverageRating = 4.7m },
                new Car { Id = -4, Make = "Audi", Model = "R8 V10", Year = 2022, CarType = "Sports Car", PricePerDay = 2200, PricePerHour = 180, PricePerWeek = 13000, Mileage = 12000, Engine = "V10", Province = "Gauteng", Description = "Mid-engine thrill with Quattro grip.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.6m },
                new Car { Id = -5, Make = "Range Rover", Model = "SVAutobiography", Year = 2024, CarType = "SUV", PricePerDay = 2000, PricePerHour = 160, PricePerWeek = 12000, Mileage = 1000, Engine = "V8 Supercharged", Province = "Eastern Cape", Description = "Ultimate luxury SUV for off-road elegance.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.8m },
                new Car { Id = -6, Make = "Ferrari", Model = "Roma", Year = 2023, CarType = "Coupe", PricePerDay = 4000, PricePerHour = 350, PricePerWeek = 24000, Mileage = 3000, Engine = "V8 Twin-Turbo", Province = "Mpumalanga", Description = "Italian grand tourer with passionate design.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.9m },
                new Car { Id = -7, Make = "Lamborghini", Model = "Huracan", Year = 2022, CarType = "Sports Car", PricePerDay = 3800, PricePerHour = 320, PricePerWeek = 22000, Mileage = 15000, Engine = "V10", Province = "Free State", Description = "Exotic supercar with aggressive styling.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.7m },
                new Car { Id = -8, Make = "Tesla", Model = "Model S Plaid", Year = 2024, CarType = "Sedan", PricePerDay = 1600, PricePerHour = 130, PricePerWeek = 9500, Mileage = 4000, Engine = "Electric Tri-Motor", Province = "North West", Description = "Electric hypercar with insane acceleration.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.5m },
                new Car { Id = -9, Make = "Bentley", Model = "Continental GT", Year = 2023, CarType = "Convertible", PricePerDay = 2800, PricePerHour = 220, PricePerWeek = 17000, Mileage = 6000, Engine = "W12", Province = "Northern Cape", Description = "Opulent grand tourer for open-top luxury.", ImageUrls = "[]", IsAvailable = true, AverageRating = 4.8m },
                new Car { Id = -10, Make = "Rolls-Royce", Model = "Ghost", Year = 2024, CarType = "Luxury", PricePerDay = 5000, PricePerHour = 400, PricePerWeek = 30000, Mileage = 500, Engine = "V12 Twin-Turbo", Province = "Limpopo", Description = "Bespoke serenity on wheels.", ImageUrls = "[]", IsAvailable = true, AverageRating = 5.0m }
            );
        }

        private void SeedDefaultContactInfo(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ContactInfo>().HasData(
                new ContactInfo
                {
                    Id = -1,
                    // Address
                    Address = "123 Luxury Avenue, Sandton, Johannesburg, 2196",
                    Street = "123 Luxury Avenue",
                    City = "Sandton",
                    Province = "Gauteng",
                    PostalCode = "2196",
                    Country = "South Africa",

                    // Phone
                    PhoneMain = "+27 65 599 5628",
                    PhoneSupport = "+27 65 599 5628",

                    // Email
                    EmailInfo = "info@safariwheels.co.za",
                    EmailSupport = "support@safariwheels.co.za",

                    // Hours
                    MondayHours = "8:00 AM - 6:00 PM",
                    TuesdayHours = "8:00 AM - 6:00 PM",
                    WednesdayHours = "8:00 AM - 6:00 PM",
                    ThursdayHours = "8:00 AM - 6:00 PM",
                    FridayHours = "8:00 AM - 6:00 PM",
                    SaturdayHours = "9:00 AM - 4:00 PM",
                    SundayHours = "10:00 AM - 2:00 PM",

                    // Social Media
                    Facebook = "https://facebook.com/safariwheels",
                    Twitter = "https://twitter.com/safariwheels",
                    Instagram = "https://instagram.com/safariwheels",
                    LinkedIn = "https://linkedin.com/company/safariwheels"
                }
            );
        }

        private void SeedSampleLocations(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Location>().HasData(
                new Location
                {
                    Id = -1,
                    Province = "Gauteng",
                    CitiesJson = "[\"Johannesburg\",\"Pretoria\",\"Sandton\",\"Centurion\"]",
                    Address = "123 Luxury Avenue, Sandton, Johannesburg",
                    Phone = "+27 11 123 4567",
                    Hours = "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM",
                    Latitude = -26.107,
                    Longitude = 28.056,
                    IsActive = true
                },
                new Location
                {
                    Id = -2,
                    Province = "Western Cape",
                    CitiesJson = "[\"Cape Town\",\"Stellenbosch\",\"Paarl\",\"Somerset West\"]",
                    Address = "45 Vineyard Road, Cape Town City Centre",
                    Phone = "+27 21 456 7890",
                    Hours = "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM",
                    Latitude = -33.925,
                    Longitude = 18.424,
                    IsActive = true
                },
                new Location
                {
                    Id = -3,
                    Province = "KwaZulu-Natal",
                    CitiesJson = "[\"Durban\",\"Umhlanga\",\"Ballito\",\"Pietermaritzburg\"]",
                    Address = "78 Beach Road, Umhlanga Rocks, Durban",
                    Phone = "+27 31 234 5678",
                    Hours = "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM",
                    Latitude = -29.717,
                    Longitude = 31.066,
                    IsActive = true
                },
                new Location
                {
                    Id = -4,
                    Province = "Eastern Cape",
                    CitiesJson = "[\"Port Elizabeth\",\"East London\",\"Grahamstown\"]",
                    Address = "32 Harbour View, Port Elizabeth Central",
                    Phone = "+27 41 345 6789",
                    Hours = "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM",
                    Latitude = -33.960,
                    Longitude = 25.602,
                    IsActive = true
                },
                new Location
                {
                    Id = -5,
                    Province = "Free State",
                    CitiesJson = "[\"Bloemfontein\",\"Welkom\",\"Bethlehem\"]",
                    Address = "15 Park Road, Bloemfontein Central",
                    Phone = "+27 51 456 7890",
                    Hours = "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM",
                    Latitude = -29.116,
                    Longitude = 26.215,
                    IsActive = true
                },
                new Location
                {
                    Id = -6,
                    Province = "Mpumalanga",
                    CitiesJson = "[\"Nelspruit\",\"Witbank\",\"Middleburg\"]",
                    Address = "9 Kruger Street, Nelspruit",
                    Phone = "+27 13 567 8901",
                    Hours = "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM",
                    Latitude = -25.475,
                    Longitude = 30.970,
                    IsActive = true
                },
                new Location
                {
                    Id = -7,
                    Province = "Limpopo",
                    CitiesJson = "[\"Polokwane\",\"Tzaneen\",\"Modimolle\"]",
                    Address = "27 Savannah Street, Polokwane Central",
                    Phone = "+27 15 678 9012",
                    Hours = "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM",
                    Latitude = -23.900,
                    Longitude = 29.450,
                    IsActive = true
                },
                new Location
                {
                    Id = -8,
                    Province = "North West",
                    CitiesJson = "[\"Rustenburg\",\"Mahikeng\",\"Potchefstroom\"]",
                    Address = "34 Platinum Road, Rustenburg",
                    Phone = "+27 14 789 0123",
                    Hours = "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM",
                    Latitude = -25.650,
                    Longitude = 27.240,
                    IsActive = true
                },
                new Location
                {
                    Id = -9,
                    Province = "Northern Cape",
                    CitiesJson = "[\"Kimberley\",\"Upington\",\"Springbok\"]",
                    Address = "12 Diamond Avenue, Kimberley",
                    Phone = "+27 53 890 1234",
                    Hours = "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 12:00 PM",
                    Latitude = -28.741,
                    Longitude = 24.762,
                    IsActive = true
                }
            );
        }
    }
}
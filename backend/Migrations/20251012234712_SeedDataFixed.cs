using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SafariWheels.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedDataFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Cars",
                columns: new[] { "Id", "AverageRating", "CarType", "Description", "Engine", "ImageUrls", "IsAvailable", "Make", "Mileage", "Model", "PricePerDay", "PricePerHour", "PricePerWeek", "Province", "Year" },
                values: new object[,]
                {
                    { -10, 5.0m, "Luxury", "Bespoke serenity on wheels.", "V12 Twin-Turbo", "[]", true, "Rolls-Royce", 500, "Ghost", 5000m, 400m, 30000m, "Limpopo", 2024 },
                    { -9, 4.8m, "Convertible", "Opulent grand tourer for open-top luxury.", "W12", "[]", true, "Bentley", 6000, "Continental GT", 2800m, 220m, 17000m, "Northern Cape", 2023 },
                    { -8, 4.5m, "Sedan", "Electric hypercar with insane acceleration.", "Electric Tri-Motor", "[]", true, "Tesla", 4000, "Model S Plaid", 1600m, 130m, 9500m, "North West", 2024 },
                    { -7, 4.7m, "Sports Car", "Exotic supercar with aggressive styling.", "V10", "[]", true, "Lamborghini", 15000, "Huracan", 3800m, 320m, 22000m, "Free State", 2022 },
                    { -6, 4.9m, "Coupe", "Italian grand tourer with passionate design.", "V8 Twin-Turbo", "[]", true, "Ferrari", 3000, "Roma", 4000m, 350m, 24000m, "Mpumalanga", 2023 },
                    { -5, 4.8m, "SUV", "Ultimate luxury SUV for off-road elegance.", "V8 Supercharged", "[]", true, "Range Rover", 1000, "SVAutobiography", 2000m, 160m, 12000m, "Eastern Cape", 2024 },
                    { -4, 4.6m, "Sports Car", "Mid-engine thrill with Quattro grip.", "V10", "[]", true, "Audi", 12000, "R8 V10", 2200m, 180m, 13000m, "Gauteng", 2022 },
                    { -3, 4.7m, "Sports Car", "Iconic supercar with unmatched handling.", "Flat-6 Twin-Turbo", "[]", false, "Porsche", 8000, "911 Turbo S", 3500m, 300m, 20000m, "KwaZulu-Natal", 2023 },
                    { -2, 4.9m, "Luxury", "Exquisite comfort and advanced tech for executives.", "V6 Hybrid", "[]", true, "Mercedes-Benz", 2000, "S-Class", 1800m, 150m, 11000m, "Western Cape", 2024 },
                    { -1, 4.8m, "Sports Car", "Ultimate grand tourer with blistering performance.", "V8 Twin-Turbo", "[]", true, "BMW", 5000, "M8 Competition", 2500m, 200m, 15000m, "Gauteng", 2023 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Address", "DriverLicenseNumber", "Email", "FirstName", "LastName", "PasswordHash", "PhoneNumber", "Role" },
                values: new object[] { -1, "123 Luxury Avenue, Sandton", "ADMIN123", "admin@safariwheels.co.za", "Admin", "User", "YWRtaW4xMjNzYWx0", "+27 11 123 4567", "Admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -10);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -9);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -8);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -7);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -6);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -5);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -4);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -3);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -2);

            migrationBuilder.DeleteData(
                table: "Cars",
                keyColumn: "Id",
                keyValue: -1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: -1);
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SafariWheels.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMessagesContactInfoLocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Rentals",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "ContactInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Province = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneMain = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneSupport = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailSupport = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MondayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TuesdayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WednesdayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThursdayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FridayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SaturdayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SundayHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Facebook = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Twitter = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Instagram = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LinkedIn = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactInfos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Province = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CitiesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Hours = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Latitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: false),
                    Longitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CitiesList = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MessageReplies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageId = table.Column<int>(type: "int", nullable: false),
                    ReplyText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepliedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageReplies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageReplies_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ContactInfos",
                columns: new[] { "Id", "Address", "City", "Country", "EmailInfo", "EmailSupport", "Facebook", "FridayHours", "Instagram", "LinkedIn", "MondayHours", "PhoneMain", "PhoneSupport", "PostalCode", "Province", "SaturdayHours", "Street", "SundayHours", "ThursdayHours", "TuesdayHours", "Twitter", "WednesdayHours" },
                values: new object[] { -1, "123 Luxury Avenue, Sandton, Johannesburg, 2196", "Sandton", "South Africa", "info@safariwheels.co.za", "support@safariwheels.co.za", "https://facebook.com/safariwheels", "8:00 AM - 6:00 PM", "https://instagram.com/safariwheels", "https://linkedin.com/company/safariwheels", "8:00 AM - 6:00 PM", "+27 65 599 5628", "+27 65 599 5628", "2196", "Gauteng", "9:00 AM - 4:00 PM", "123 Luxury Avenue", "10:00 AM - 2:00 PM", "8:00 AM - 6:00 PM", "8:00 AM - 6:00 PM", "https://twitter.com/safariwheels", "8:00 AM - 6:00 PM" });

            migrationBuilder.InsertData(
                table: "Locations",
                columns: new[] { "Id", "Address", "CitiesJson", "CitiesList", "Hours", "IsActive", "Latitude", "Longitude", "Phone", "Province" },
                values: new object[,]
                {
                    { -9, "12 Diamond Avenue, Kimberley", "[\"Kimberley\",\"Upington\",\"Springbok\"]", "[\"Kimberley\",\"Upington\",\"Springbok\"]", "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 12:00 PM", true, -28.741, 24.762, "+27 53 890 1234", "Northern Cape" },
                    { -8, "34 Platinum Road, Rustenburg", "[\"Rustenburg\",\"Mahikeng\",\"Potchefstroom\"]", "[\"Rustenburg\",\"Mahikeng\",\"Potchefstroom\"]", "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM", true, -25.649999999999999, 27.239999999999998, "+27 14 789 0123", "North West" },
                    { -7, "27 Savannah Street, Polokwane Central", "[\"Polokwane\",\"Tzaneen\",\"Modimolle\"]", "[\"Polokwane\",\"Tzaneen\",\"Modimolle\"]", "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM", true, -23.899999999999999, 29.449999999999999, "+27 15 678 9012", "Limpopo" },
                    { -6, "9 Kruger Street, Nelspruit", "[\"Nelspruit\",\"Witbank\",\"Middleburg\"]", "[\"Nelspruit\",\"Witbank\",\"Middleburg\"]", "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM", true, -25.475000000000001, 30.969999999999999, "+27 13 567 8901", "Mpumalanga" },
                    { -5, "15 Park Road, Bloemfontein Central", "[\"Bloemfontein\",\"Welkom\",\"Bethlehem\"]", "[\"Bloemfontein\",\"Welkom\",\"Bethlehem\"]", "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM", true, -29.116, 26.215, "+27 51 456 7890", "Free State" },
                    { -4, "32 Harbour View, Port Elizabeth Central", "[\"Port Elizabeth\",\"East London\",\"Grahamstown\"]", "[\"Port Elizabeth\",\"East London\",\"Grahamstown\"]", "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM", true, -33.960000000000001, 25.602, "+27 41 345 6789", "Eastern Cape" },
                    { -3, "78 Beach Road, Umhlanga Rocks, Durban", "[\"Durban\",\"Umhlanga\",\"Ballito\",\"Pietermaritzburg\"]", "[\"Durban\",\"Umhlanga\",\"Ballito\",\"Pietermaritzburg\"]", "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM", true, -29.716999999999999, 31.065999999999999, "+27 31 234 5678", "KwaZulu-Natal" },
                    { -2, "45 Vineyard Road, Cape Town City Centre", "[\"Cape Town\",\"Stellenbosch\",\"Paarl\",\"Somerset West\"]", "[\"Cape Town\",\"Stellenbosch\",\"Paarl\",\"Somerset West\"]", "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM", true, -33.924999999999997, 18.423999999999999, "+27 21 456 7890", "Western Cape" },
                    { -1, "123 Luxury Avenue, Sandton, Johannesburg", "[\"Johannesburg\",\"Pretoria\",\"Sandton\",\"Centurion\"]", "[\"Johannesburg\",\"Pretoria\",\"Sandton\",\"Centurion\"]", "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM", true, -26.106999999999999, 28.056000000000001, "+27 11 123 4567", "Gauteng" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: -1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 14, 10, 51, 451, DateTimeKind.Utc).AddTicks(4410));

            migrationBuilder.CreateIndex(
                name: "IX_ContactInfos_Id",
                table: "ContactInfos",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_IsActive",
                table: "Locations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_Province",
                table: "Locations",
                column: "Province");

            migrationBuilder.CreateIndex(
                name: "IX_MessageReplies_MessageId",
                table: "MessageReplies",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_CreatedAt",
                table: "Messages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_IsRead",
                table: "Messages",
                column: "IsRead");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactInfos");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropTable(
                name: "MessageReplies");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Rentals");
        }
    }
}

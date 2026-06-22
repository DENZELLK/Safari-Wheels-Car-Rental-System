// Controllers/CarsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Data;
using SafariWheels.API.Models;
using SafariWheels.API.DTOs;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CarsController> _logger;
        private readonly IWebHostEnvironment _environment;

        public CarsController(ApplicationDbContext context, ILogger<CarsController> logger, IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? pickupLocation, [FromQuery] string? carType, [FromQuery] decimal? maxPrice, [FromQuery] string? carName)
        {
            try
            {
                _logger.LogInformation("Getting all cars with filters - PickupLocation: {PickupLocation}, CarType: {CarType}, MaxPrice: {MaxPrice}, CarName: {CarName}",
                    pickupLocation, carType, maxPrice, carName);

                var query = _context.Cars.AsQueryable();

                // Filtered query example: filter by province (pickupLocation), carType, maxPrice, carName
                if (!string.IsNullOrEmpty(pickupLocation))
                    query = query.Where(c => c.Province == pickupLocation);

                if (!string.IsNullOrEmpty(carType))
                    query = query.Where(c => c.CarType == carType);

                if (maxPrice.HasValue)
                    query = query.Where(c => c.PricePerDay <= maxPrice.Value);

                if (!string.IsNullOrEmpty(carName))
                    query = query.Where(c => c.Make.Contains(carName) || c.Model.Contains(carName));

                var cars = await query.ToListAsync();

                // Convert to response DTOs
                var carDtos = cars.Select(c => new CarResponseDto
                {
                    Id = c.Id,
                    Make = c.Make,
                    Model = c.Model,
                    Year = c.Year,
                    CarType = c.CarType,
                    PricePerDay = c.PricePerDay,
                    PricePerHour = c.PricePerHour,
                    PricePerWeek = c.PricePerWeek,
                    Mileage = c.Mileage,
                    Engine = c.Engine,
                    Province = c.Province,
                    Description = c.Description,
                    ImageUrls = c.GetImageUrls(),
                    IsAvailable = c.IsAvailable,
                    AverageRating = c.AverageRating
                }).ToList();

                _logger.LogInformation("Returning {CarCount} cars", carDtos.Count);

                if (carDtos.Any())
                {
                    var firstCar = carDtos.First();
                    _logger.LogInformation("First car: {Make} {Model}, PricePerDay: {PricePerDay}, PricePerHour: {PricePerHour}, PricePerWeek: {PricePerWeek}",
                        firstCar.Make, firstCar.Model, firstCar.PricePerDay, firstCar.PricePerHour, firstCar.PricePerWeek);
                }

                return Ok(carDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cars");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting car by ID: {Id}", id);

                var car = await _context.Cars.FindAsync(id);

                if (car == null)
                {
                    _logger.LogWarning("Car with ID {Id} not found", id);
                    return NotFound(new { message = "Car not found" });
                }

                var carDto = new CarResponseDto
                {
                    Id = car.Id,
                    Make = car.Make,
                    Model = car.Model,
                    Year = car.Year,
                    CarType = car.CarType,
                    PricePerDay = car.PricePerDay,
                    PricePerHour = car.PricePerHour,
                    PricePerWeek = car.PricePerWeek,
                    Mileage = car.Mileage,
                    Engine = car.Engine,
                    Province = car.Province,
                    Description = car.Description,
                    ImageUrls = car.GetImageUrls(),
                    IsAvailable = car.IsAvailable,
                    AverageRating = car.AverageRating
                };

                _logger.LogInformation("Found car: {Make} {Model}", car.Make, car.Model);
                return Ok(carDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting car by ID: {Id}", id);
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured()
        {
            try
            {
                _logger.LogInformation("Getting featured cars");

                var featured = await _context.Cars
                    .Where(c => c.AverageRating >= 4.5m && c.IsAvailable)
                    .Take(6)
                    .ToListAsync();

                var featuredDtos = featured.Select(c => new CarResponseDto
                {
                    Id = c.Id,
                    Make = c.Make,
                    Model = c.Model,
                    Year = c.Year,
                    CarType = c.CarType,
                    PricePerDay = c.PricePerDay,
                    PricePerHour = c.PricePerHour,
                    PricePerWeek = c.PricePerWeek,
                    Mileage = c.Mileage,
                    Engine = c.Engine,
                    Province = c.Province,
                    Description = c.Description,
                    ImageUrls = c.GetImageUrls(),
                    IsAvailable = c.IsAvailable,
                    AverageRating = c.AverageRating
                }).ToList();

                _logger.LogInformation("Returning {Count} featured cars", featuredDtos.Count);
                return Ok(featuredDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured cars");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("test-data")]
        public IActionResult GetTestData()
        {
            var testCar = new CarResponseDto
            {
                Id = 999,
                Make = "Test",
                Model = "Car",
                Year = 2024,
                CarType = "Sedan",
                PricePerDay = 1000,
                PricePerHour = 100,
                PricePerWeek = 5000,
                Mileage = 1000,
                Engine = "Test Engine",
                Province = "Gauteng",
                Description = "Test car for debugging",
                ImageUrls = new List<string>(),
                IsAvailable = true,
                AverageRating = 4.5m
            };

            _logger.LogInformation("Returning test car data");
            return Ok(new List<CarResponseDto> { testCar });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateCarDto carDto)
        {
            try
            {
                _logger.LogInformation("Creating new car: {Make} {Model}", carDto.Make, carDto.Model);

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for car creation");
                    return BadRequest(ModelState);
                }

                var car = new Car
                {
                    Make = carDto.Make,
                    Model = carDto.Model,
                    Year = carDto.Year,
                    CarType = carDto.CarType,
                    PricePerDay = carDto.PricePerDay,
                    PricePerHour = carDto.PricePerHour,
                    PricePerWeek = carDto.PricePerWeek,
                    Mileage = carDto.Mileage,
                    Engine = carDto.Engine,
                    Province = carDto.Province,
                    Description = carDto.Description,
                    IsAvailable = carDto.IsAvailable
                };

                // Handle image uploads
                var imageUrls = new List<string>();
                if (carDto.Images != null && carDto.Images.Count > 0)
                {
                    foreach (var image in carDto.Images)
                    {
                        var imageUrl = await SaveImage(image);
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            imageUrls.Add(imageUrl);
                            _logger.LogInformation("Image uploaded: {ImageUrl}", imageUrl);
                        }
                    }
                    car.SetImageUrls(imageUrls);
                }

                _context.Cars.Add(car);
                await _context.SaveChangesAsync();

                // Return the created car as response DTO
                var responseDto = new CarResponseDto
                {
                    Id = car.Id,
                    Make = car.Make,
                    Model = car.Model,
                    Year = car.Year,
                    CarType = car.CarType,
                    PricePerDay = car.PricePerDay,
                    PricePerHour = car.PricePerHour,
                    PricePerWeek = car.PricePerWeek,
                    Mileage = car.Mileage,
                    Engine = car.Engine,
                    Province = car.Province,
                    Description = car.Description,
                    ImageUrls = car.GetImageUrls(),
                    IsAvailable = car.IsAvailable,
                    AverageRating = car.AverageRating
                };

                _logger.LogInformation("Car created successfully with ID: {Id}", car.Id);
                return CreatedAtAction(nameof(GetById), new { id = car.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating car");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateCarDto carDto)
        {
            try
            {
                _logger.LogInformation("Updating car with ID: {Id}", id);

                var car = await _context.Cars.FindAsync(id);
                if (car == null)
                {
                    _logger.LogWarning("Car with ID {Id} not found for update", id);
                    return NotFound(new { message = "Car not found" });
                }

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for car update");
                    return BadRequest(ModelState);
                }

                // Update car properties
                car.Make = carDto.Make;
                car.Model = carDto.Model;
                car.Year = carDto.Year;
                car.CarType = carDto.CarType;
                car.PricePerDay = carDto.PricePerDay;
                car.PricePerHour = carDto.PricePerHour;
                car.PricePerWeek = carDto.PricePerWeek;
                car.Mileage = carDto.Mileage;
                car.Engine = carDto.Engine;
                car.Province = carDto.Province;
                car.Description = carDto.Description;
                car.IsAvailable = carDto.IsAvailable;

                // Handle image updates
                var currentImageUrls = car.GetImageUrls();

                // Remove specified images
                if (carDto.ImagesToRemove != null && carDto.ImagesToRemove.Count > 0)
                {
                    foreach (var imageUrl in carDto.ImagesToRemove)
                    {
                        DeleteImage(imageUrl);
                        currentImageUrls.Remove(imageUrl);
                        _logger.LogInformation("Image removed: {ImageUrl}", imageUrl);
                    }
                }

                // Add new images
                if (carDto.NewImages != null && carDto.NewImages.Count > 0)
                {
                    foreach (var image in carDto.NewImages)
                    {
                        var imageUrl = await SaveImage(image);
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            currentImageUrls.Add(imageUrl);
                            _logger.LogInformation("New image added: {ImageUrl}", imageUrl);
                        }
                    }
                }

                // Set final image URLs
                car.SetImageUrls(currentImageUrls);

                _context.Cars.Update(car);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Car updated successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating car with ID: {Id}", id);
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting car with ID: {Id}", id);

                var car = await _context.Cars.FindAsync(id);
                if (car == null)
                {
                    _logger.LogWarning("Car with ID {Id} not found for deletion", id);
                    return NotFound(new { message = "Car not found" });
                }

                // Delete associated images
                var imageUrls = car.GetImageUrls();
                foreach (var imageUrl in imageUrls)
                {
                    DeleteImage(imageUrl);
                    _logger.LogInformation("Car image deleted: {ImageUrl}", imageUrl);
                }

                _context.Cars.Remove(car);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Car deleted successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting car with ID: {Id}", id);
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        private async Task<string?> SaveImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "cars");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Get a safe and unique filename
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException("Invalid file type. Allowed types: JPG, PNG, WEBP.");

            if (file.Length > 5 * 1024 * 1024)
                throw new InvalidOperationException("File size exceeds 5MB limit.");

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file to wwwroot/uploads/cars
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 🔥 Generate full absolute URL dynamically
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var imageUrl = $"{baseUrl}/uploads/cars/{fileName}";

            _logger.LogInformation($"✅ Image saved successfully: {imageUrl}");
            return imageUrl;
        }


        private void DeleteImage(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl)) return;

                // Extract filename from URL
                var fileName = Path.GetFileName(imageUrl);
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", "cars", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    _logger.LogInformation("Image file deleted: {FilePath}", filePath);
                }
                else
                {
                    _logger.LogWarning("Image file not found: {FilePath}", filePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {ImageUrl}", imageUrl);
            }
        }
    }
}
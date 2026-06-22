using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafariWheels.API.Data;
using SafariWheels.API.DTOs;
using SafariWheels.API.Models;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LocationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/locations
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<LocationResponseDto>>> GetAllLocations()
        {
            var locations = await _context.Locations
                .Select(l => new LocationResponseDto
                {
                    Id = l.Id,
                    Province = l.Province,
                    Cities = l.CitiesList,
                    Address = l.Address,
                    Phone = l.Phone ?? string.Empty,
                    Hours = l.Hours ?? string.Empty,
                    Coordinates = new CoordinatesDto
                    {
                        Lat = l.Latitude,
                        Lng = l.Longitude
                    },
                    IsActive = l.IsActive
                })
                .ToListAsync();

            return Ok(locations);
        }

        // GET: api/locations/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<LocationResponseDto>> GetLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            var response = new LocationResponseDto
            {
                Id = location.Id,
                Province = location.Province,
                Cities = location.CitiesList,
                Address = location.Address,
                Phone = location.Phone ?? string.Empty,
                Hours = location.Hours ?? string.Empty,
                Coordinates = new CoordinatesDto
                {
                    Lat = location.Latitude,
                    Lng = location.Longitude
                },
                IsActive = location.IsActive
            };

            return Ok(response);
        }

        // GET: api/locations/province/{province}
        [HttpGet("province/{province}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<LocationResponseDto>>> GetLocationsByProvince(string province)
        {
            var locations = await _context.Locations
                .Where(l => l.Province == province && l.IsActive)
                .Select(l => new LocationResponseDto
                {
                    Id = l.Id,
                    Province = l.Province,
                    Cities = l.CitiesList,
                    Address = l.Address,
                    Phone = l.Phone ?? string.Empty,
                    Hours = l.Hours ?? string.Empty,
                    Coordinates = new CoordinatesDto
                    {
                        Lat = l.Latitude,
                        Lng = l.Longitude
                    },
                    IsActive = l.IsActive
                })
                .ToListAsync();

            return Ok(locations);
        }

        // POST: api/locations (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateLocation([FromBody] CreateLocationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var location = new Location
            {
                Province = dto.Province,
                CitiesList = dto.Cities,
                Address = dto.Address,
                Phone = dto.Phone,
                Hours = dto.Hours,
                Latitude = dto.Coordinates.Lat,
                Longitude = dto.Coordinates.Lng,
                IsActive = dto.IsActive
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = location.Id,
                message = "Location created successfully"
            });
        }

        // PUT: api/locations/{id} (Admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] UpdateLocationDto dto)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            if (!string.IsNullOrEmpty(dto.Province))
                location.Province = dto.Province;

            if (dto.Cities != null && dto.Cities.Any())
                location.CitiesList = dto.Cities;

            if (!string.IsNullOrEmpty(dto.Address))
                location.Address = dto.Address;

            if (!string.IsNullOrEmpty(dto.Phone))
                location.Phone = dto.Phone;

            if (!string.IsNullOrEmpty(dto.Hours))
                location.Hours = dto.Hours;

            if (dto.Coordinates != null)
            {
                location.Latitude = dto.Coordinates.Lat;
                location.Longitude = dto.Coordinates.Lng;
            }

            location.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Location updated successfully" });
        }

        // PATCH: api/locations/{id}/toggle (Admin only)
        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleLocationActive(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            location.IsActive = !location.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Location {(location.IsActive ? "activated" : "deactivated")} successfully",
                isActive = location.IsActive
            });
        }

        // DELETE: api/locations/{id} (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Location deleted successfully" });
        }
    }
}

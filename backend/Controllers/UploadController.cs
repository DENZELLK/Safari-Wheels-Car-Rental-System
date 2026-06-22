using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace SafariWheels.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("car-image")]
        public async Task<IActionResult> UploadCarImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            //  Save inside wwwroot/uploads/cars
            string uploadPath = Path.Combine(_environment.WebRootPath, "uploads", "cars");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            //  Create a unique filename
            string fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            string filePath = Path.Combine(uploadPath, fileName);

            //  Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            //  Generate a URL for the uploaded image
            string fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/cars/{fileName}";

            return Ok(new { fileUrl });
        }
    }
}

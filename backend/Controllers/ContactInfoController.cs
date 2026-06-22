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
    public class ContactInfoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactInfoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/contactinfo
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ContactInfoResponseDto>> GetContactInfo()
        {
            var contactInfo = await _context.ContactInfos.FirstOrDefaultAsync();

            // If no contact info exists, create default
            if (contactInfo == null)
            {
                contactInfo = new ContactInfo
                {
                    Address = "123 Luxury Avenue, Sandton, Johannesburg, 2196",
                    Street = "123 Luxury Avenue",
                    City = "Sandton",
                    Province = "Gauteng",
                    PostalCode = "2196",
                    Country = "South Africa",
                    PhoneMain = "+27 65 599 5628",
                    PhoneSupport = "+27 65 599 5628",
                    EmailInfo = "info@safariwheels.co.za",
                    EmailSupport = "support@safariwheels.co.za",
                    MondayHours = "8:00 AM - 6:00 PM",
                    TuesdayHours = "8:00 AM - 6:00 PM",
                    WednesdayHours = "8:00 AM - 6:00 PM",
                    ThursdayHours = "8:00 AM - 6:00 PM",
                    FridayHours = "8:00 AM - 6:00 PM",
                    SaturdayHours = "9:00 AM - 4:00 PM",
                    SundayHours = "10:00 AM - 2:00 PM",
                    Facebook = "https://facebook.com/safariwheels",
                    Twitter = "https://twitter.com/safariwheels",
                    Instagram = "https://instagram.com/safariwheels",
                    LinkedIn = "https://linkedin.com/company/safariwheels"
                };
                _context.ContactInfos.Add(contactInfo);
                await _context.SaveChangesAsync();
            }

            var response = new ContactInfoResponseDto
            {
                Address = new AddressDto
                {
                    Full = contactInfo.Address,
                    Street = contactInfo.Street,
                    City = contactInfo.City,
                    Province = contactInfo.Province,
                    PostalCode = contactInfo.PostalCode,
                    Country = contactInfo.Country ?? "South Africa"
                },
                Phone = new PhoneDto
                {
                    Main = contactInfo.PhoneMain,
                    Support = contactInfo.PhoneSupport
                },
                Email = new EmailDto
                {
                    Info = contactInfo.EmailInfo,
                    Support = contactInfo.EmailSupport
                },
                Hours = new HoursDto
                {
                    Monday = contactInfo.MondayHours,
                    Tuesday = contactInfo.TuesdayHours,
                    Wednesday = contactInfo.WednesdayHours,
                    Thursday = contactInfo.ThursdayHours,
                    Friday = contactInfo.FridayHours,
                    Saturday = contactInfo.SaturdayHours,
                    Sunday = contactInfo.SundayHours
                },
                SocialMedia = new SocialMediaDto
                {
                    Facebook = contactInfo.Facebook,
                    Twitter = contactInfo.Twitter,
                    Instagram = contactInfo.Instagram,
                    Linkedin = contactInfo.LinkedIn
                }
            };

            return Ok(response);
        }

        // PUT: api/contactinfo
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateContactInfo([FromBody] UpdateContactInfoDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var contactInfo = await _context.ContactInfos.FirstOrDefaultAsync();
            if (contactInfo == null)
            {
                contactInfo = new ContactInfo();
                _context.ContactInfos.Add(contactInfo);
            }

            // Update address
            if (dto.Address != null)
            {
                contactInfo.Address = dto.Address.Full ?? contactInfo.Address;
                contactInfo.Street = dto.Address.Street ?? contactInfo.Street;
                contactInfo.City = dto.Address.City ?? contactInfo.City;
                contactInfo.Province = dto.Address.Province ?? contactInfo.Province;
                contactInfo.PostalCode = dto.Address.PostalCode ?? contactInfo.PostalCode;
                contactInfo.Country = dto.Address.Country ?? contactInfo.Country ?? "South Africa";
            }

            // Update phone
            if (dto.Phone != null)
            {
                contactInfo.PhoneMain = dto.Phone.Main ?? contactInfo.PhoneMain;
                contactInfo.PhoneSupport = dto.Phone.Support ?? contactInfo.PhoneSupport;
            }

            // Update email
            if (dto.Email != null)
            {
                contactInfo.EmailInfo = dto.Email.Info ?? contactInfo.EmailInfo;
                contactInfo.EmailSupport = dto.Email.Support ?? contactInfo.EmailSupport;
            }

            // Update hours
            if (dto.Hours != null)
            {
                contactInfo.MondayHours = dto.Hours.Monday ?? contactInfo.MondayHours;
                contactInfo.TuesdayHours = dto.Hours.Tuesday ?? contactInfo.TuesdayHours;
                contactInfo.WednesdayHours = dto.Hours.Wednesday ?? contactInfo.WednesdayHours;
                contactInfo.ThursdayHours = dto.Hours.Thursday ?? contactInfo.ThursdayHours;
                contactInfo.FridayHours = dto.Hours.Friday ?? contactInfo.FridayHours;
                contactInfo.SaturdayHours = dto.Hours.Saturday ?? contactInfo.SaturdayHours;
                contactInfo.SundayHours = dto.Hours.Sunday ?? contactInfo.SundayHours;
            }

            // Update social media
            if (dto.SocialMedia != null)
            {
                contactInfo.Facebook = dto.SocialMedia.Facebook ?? contactInfo.Facebook;
                contactInfo.Twitter = dto.SocialMedia.Twitter ?? contactInfo.Twitter;
                contactInfo.Instagram = dto.SocialMedia.Instagram ?? contactInfo.Instagram;
                contactInfo.LinkedIn = dto.SocialMedia.Linkedin ?? contactInfo.LinkedIn;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Contact information updated successfully" });
        }
    }
}

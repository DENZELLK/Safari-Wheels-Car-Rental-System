namespace SafariWheels.API.DTOs
{
    // Address DTO
    public class AddressDto
    {
        public string? Full { get; set; }
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
    }

    // Phone DTO
    public class PhoneDto
    {
        public string? Main { get; set; }
        public string? Support { get; set; }
    }

    // Email DTO
    public class EmailDto
    {
        public string? Info { get; set; }
        public string? Support { get; set; }
    }

    // Hours DTO
    public class HoursDto
    {
        public string? Monday { get; set; }
        public string? Tuesday { get; set; }
        public string? Wednesday { get; set; }
        public string? Thursday { get; set; }
        public string? Friday { get; set; }
        public string? Saturday { get; set; }
        public string? Sunday { get; set; }
    }

    // Social Media DTO
    public class SocialMediaDto
    {
        public string? Facebook { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
        public string? Linkedin { get; set; }
    }

    // Main Contact Info DTO for updates
    public class UpdateContactInfoDto
    {
        public AddressDto? Address { get; set; }
        public PhoneDto? Phone { get; set; }
        public EmailDto? Email { get; set; }
        public HoursDto? Hours { get; set; }
        public SocialMediaDto? SocialMedia { get; set; }
    }

    // Contact Info Response DTO
    public class ContactInfoResponseDto
    {
        public AddressDto Address { get; set; } = new AddressDto();
        public PhoneDto Phone { get; set; } = new PhoneDto();
        public EmailDto Email { get; set; } = new EmailDto();
        public HoursDto Hours { get; set; } = new HoursDto();
        public SocialMediaDto SocialMedia { get; set; } = new SocialMediaDto();
    }
}

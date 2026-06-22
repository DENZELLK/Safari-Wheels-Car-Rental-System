namespace SafariWheels.API.Models
{
    public class ContactInfo
    {
        public int Id { get; set; }

        // Address
        public string Address { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }

        // Phone
        public string PhoneMain { get; set; }
        public string PhoneSupport { get; set; }

        // Email
        public string EmailInfo { get; set; }
        public string EmailSupport { get; set; }

        // Hours
        public string MondayHours { get; set; }
        public string TuesdayHours { get; set; }
        public string WednesdayHours { get; set; }
        public string ThursdayHours { get; set; }
        public string FridayHours { get; set; }
        public string SaturdayHours { get; set; }
        public string SundayHours { get; set; }

        // Social Media
        public string Facebook { get; set; }
        public string Twitter { get; set; }
        public string Instagram { get; set; }
        public string LinkedIn { get; set; }
    }
}

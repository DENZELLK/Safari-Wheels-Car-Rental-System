using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

public class CreateRentalForm
{
    [FromForm]
    public int CarId { get; set; }

    [FromForm]
    public DateTime PickupDate { get; set; }

    [FromForm]
    public DateTime ReturnDate { get; set; }

    [FromForm]
    public string? PickupLocation { get; set; }

    [FromForm]
    public string? DropoffLocation { get; set; }

    [FromForm]
    public decimal TotalAmount { get; set; }

    [FromForm]
    public IFormFile? ProofOfAddress { get; set; }
}

import React from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Terms of Service</h1>
      <p className="mb-4">
        By using Safari Wheels, you agree to the following terms and conditions. Please read carefully before booking.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">1. Use of Service</h2>
      <p className="mb-4">
        Our services are for personal and authorized business use only. Misuse or unlawful activities are strictly prohibited.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">2. Reservations & Payments</h2>
      <p className="mb-4">
        All bookings must be confirmed through our platform. Payment terms are displayed during checkout.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">3. Liability</h2>
      <p className="mb-4">
        Safari Wheels is not responsible for delays or damages caused by unforeseen events, including mechanical failures or weather conditions.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">4. Changes to Terms</h2>
      <p className="mb-6">
        We may update these terms periodically. Continued use of our services means you accept the new terms.
      </p>

      <Link
        to="/"
        className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default TermsOfService;

import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Privacy Policy</h1>
      <p className="mb-4">
        Safari Wheels values your privacy. This policy explains how we collect, use, and protect your personal information.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We may collect your name, contact details, and booking preferences when you make a reservation or contact us.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use your data to confirm bookings, process payments, improve our services, and send important updates.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">3. Protecting Your Data</h2>
      <p className="mb-4">
        Your data is stored securely and never shared with third parties unless required by law or for providing our services.
      </p>

      <h2 className="text-xl font-semibold text-amber-500 mt-6 mb-2">4. Contact Us</h2>
      <p className="mb-6">
        For questions about your privacy, email us at <strong>privacy@safariwheels.co.za</strong>.
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

export default PrivacyPolicy;

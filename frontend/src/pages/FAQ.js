import React from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I rent a car?",
      answer:
        "Simply browse our fleet, choose your preferred vehicle, and complete the booking form online.",
    },
    {
      question: "Do I need a credit card?",
      answer:
        "Yes, a valid credit card is required for booking and deposit purposes.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, cancellations can be made up to 24 hours before pickup with no penalty.",
    },
    {
      question: "Where are you located?",
      answer:
        "We operate across major cities in South Africa, including Johannesburg, Cape Town, and Durban.",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Frequently Asked Questions</h1>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h2 className="text-lg font-semibold text-amber-500">{faq.question}</h2>
            <p className="text-gray-700 mt-1">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default FAQ;

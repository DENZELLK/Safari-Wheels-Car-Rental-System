import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-amber-500">Safari Wheels</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Your premier luxury car rental service across South Africa. Experience the finest vehicles with unmatched service and nationwide coverage.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cars" className="text-gray-300 hover:text-amber-500 transition-colors">
                  Browse Fleet
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-gray-300 hover:text-amber-500 transition-colors">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-amber-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-amber-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <i className="fas fa-phone-alt text-amber-500 mr-3"></i>
                <span>+27 65 599 5628</span>
              </li>
              <li className="flex items-center text-gray-300">
                <i className="fas fa-envelope text-amber-500 mr-3"></i>
                <span>info@safariwheels.co.za</span>
              </li>
              <li className="flex items-start text-gray-300">
                <i className="fas fa-map-marker-alt text-amber-500 mr-3 mt-1"></i>
                <span>123 Luxury Lane<br />Sandton, Johannesburg<br />2196</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Safari Wheels. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-amber-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-amber-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-amber-500 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
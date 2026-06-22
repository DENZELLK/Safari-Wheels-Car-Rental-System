import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    driverLicenseNumber: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.driverLicenseNumber.trim()) {
      setError('Driver license number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Starting registration...');
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      
      // Ensure property names match backend expectations (PascalCase)
      const formattedUserData = {
        FirstName: userData.firstName,
        LastName: userData.lastName,
        Email: userData.email,
        PhoneNumber: userData.phoneNumber,
        DriverLicenseNumber: userData.driverLicenseNumber,
        Password: userData.password, // This will trigger the setter that hashes it
        Address: userData.address,
        Role: "Customer" // Default role
      };

      console.log('📤 Sending registration data:', formattedUserData);
      
      const response = await authAPI.register(formattedUserData);
      console.log('✅ Registration response:', response);
      
      // Handle response - backend now returns token and user
      let token, user;
      
      if (response.data.token && response.data.user) {
        // New structure with token and user
        token = response.data.token;
        user = response.data.user;
        console.log('✅ Registration successful with token');
      } else {
        // Fallback: if backend returns different structure, try auto-login
        console.log('🔄 Backend returned different structure, attempting auto-login...');
        const loginResponse = await authAPI.login({
          Email: formattedUserData.Email,
          Password: formattedUserData.Password
        });
        
        token = loginResponse.data.token;
        user = loginResponse.data.user;
        console.log('✅ Auto-login successful');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setLoading(false);
      setShowSuccessPopup(true);
      
      // Show success popup for 5 seconds then redirect
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/profile', { 
          state: { 
            message: 'Registration successful! Welcome to Safari Wheels.'
          }
        });
      }, 5000); // 5 seconds
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (error.response?.data) {
        // Handle different error response formats
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = validationErrors.join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. You will be redirected to your profile in 5 seconds.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-5000 ease-linear"
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to profile...
            </p>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
            <i className="fas fa-car text-white text-2xl"></i>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading || showSuccessPopup}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading || showSuccessPopup}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || showSuccessPopup}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading || showSuccessPopup}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="+27 XXX XXX XXXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-gray-700">
                Driver's License Number *
              </label>
              <div className="mt-1">
                <input
                  id="driverLicenseNumber"
                  name="driverLicenseNumber"
                  type="text"
                  required
                  value={formData.driverLicenseNumber}
                  onChange={handleChange}
                  disabled={loading || showSuccessPopup}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your license number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading || showSuccessPopup}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Your full address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || showSuccessPopup}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || showSuccessPopup}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                disabled={loading || showSuccessPopup}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded disabled:bg-gray-100"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-amber-600 hover:text-amber-500">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || showSuccessPopup}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
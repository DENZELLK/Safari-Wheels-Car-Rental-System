import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== LOGIN DEBUG START ===');
      console.log('🔐 Attempting login with:', formData.email);
      
      // Call the API with the correct structure
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Login API Response:', response);
      console.log('📦 Response data:', response.data);
      
      const { token, user } = response.data;

      console.log('🔑 Token received:', token ? 'YES' : 'NO');
      console.log('👤 User object:', user);
      console.log('👑 User Role (PascalCase):', user?.Role);
      console.log('👑 User role (camelCase):', user?.role);
      console.log('📧 User Email (PascalCase):', user?.Email);
      console.log('📧 User email (camelCase):', user?.email);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Verify storage
      console.log('💾 localStorage token:', localStorage.getItem('token') ? 'SET' : 'NOT SET');
      console.log('💾 localStorage user:', localStorage.getItem('user'));
      
      setLoading(false);
      
      // Redirect based on user role - FIXED VERSION
      console.log('🔄 Starting redirect process...');
      
      // Handle both PascalCase and camelCase for safety
      const userRole = user.Role || user.role;
      console.log('Final user role for redirect:', userRole);
      console.log('Is user role "Admin"?', userRole === 'Admin');
      
      if (userRole === 'Admin') {
        console.log('🎯 Redirecting to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('🎯 Redirecting to /profile');
        navigate('/profile', { replace: true });
      }
      
      console.log('=== LOGIN DEBUG END ===');
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('📡 Error response:', error.response);
      console.error('🔧 Error message:', error.response?.data);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
            <i className="fas fa-car text-white text-2xl"></i>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          

          {/* Demo credentials for testing */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
             
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Fetch user data
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <i className="fas fa-car text-white"></i>
            </div>
            <span className="text-xl font-bold text-gray-800">Safari Wheels</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium ${location.pathname === '/' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              Home
            </Link>
            <Link 
              to="/cars" 
              className={`font-medium ${location.pathname === '/cars' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              Cars
            </Link>
            <Link 
              to="/locations" 
              className={`font-medium ${location.pathname === '/locations' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              Locations
            </Link>
            <Link 
              to="/about" 
              className={`font-medium ${location.pathname === '/about' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium ${location.pathname === '/contact' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              Contact
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-amber-500"
                >
                  <i className="fas fa-user-circle"></i>
                  <span>{user?.firstName}</span>
                </Link>
                {user?.role === 'Admin' && (
                  <Link 
                    to="/admin" 
                    className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-amber-500"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-amber-500 font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 focus:outline-none"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`font-medium ${location.pathname === '/' ? 'text-amber-500' : 'text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/cars" 
                className={`font-medium ${location.pathname === '/cars' ? 'text-amber-500' : 'text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Cars
              </Link>
              <Link 
                to="/locations" 
                className={`font-medium ${location.pathname === '/locations' ? 'text-amber-500' : 'text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Locations
              </Link>
              <Link 
                to="/about" 
                className={`font-medium ${location.pathname === '/about' ? 'text-amber-500' : 'text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium ${location.pathname === '/contact' ? 'text-amber-500' : 'text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {isLoggedIn ? (
                <>
                  <Link 
                    to="/profile" 
                    className="font-medium text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user?.Role || user?.role) === 'Admin' && (
                    <Link 
                      to="/admin" 
                      className="font-medium text-gray-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left font-medium text-gray-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="font-medium text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="font-medium text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
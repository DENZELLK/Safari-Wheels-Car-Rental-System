import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, rentalsAPI, carsAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import imagesService from '../services/imagesService';
import { PROVINCES, CAR_TYPES, RENTAL_STATUS } from '../utils/constants';

// Import new components (we'll create these)
import RentalDetailsModal from '../components/admin/RentalDetailsModal';
import MessagesManager from '../components/admin/MessagesManager';
import LocationsManager from '../components/admin/LocationsManager';
import ContactInfoManager from '../components/admin/ContactInfoManager';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import Pagination from '../components/admin/Pagination';
import SearchBar from '../components/admin/SearchBar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalRentals: 0,
    pendingApprovals: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  
  const [recentRentals, setRecentRentals] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected rental for full view
  const [selectedRental, setSelectedRental] = useState(null);
  const [showRentalModal, setShowRentalModal] = useState(false);
  
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    carType: '',
    pricePerDay: 0,
    pricePerHour: 0,
    pricePerWeek: 0,
    mileage: 0,
    engine: '',
    province: '',
    description: '',
    isAvailable: true
  });
  
  const [carImages, setCarImages] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to normalize car data
  const normalizeCarData = (car) => {
    return {
      id: car.id || car.Id,
      make: car.make || car.Make || 'N/A',
      model: car.model || car.Model || 'N/A',
      year: car.year || car.Year || 'N/A',
      carType: car.carType || car.CarType || 'N/A',
      pricePerDay: car.pricePerDay || car.PricePerDay || 0,
      pricePerHour: car.pricePerHour || car.PricePerHour || 0,
      pricePerWeek: car.pricePerWeek || car.PricePerWeek || 0,
      engine: car.engine || car.Engine || '',
      mileage: car.mileage || car.Mileage || 0,
      province: car.province || car.Province || '',
      description: car.description || car.Description || '',
      isAvailable: car.isAvailable !== undefined ? car.isAvailable : 
                  (car.IsAvailable !== undefined ? car.IsAvailable : true),
      imageUrls: car.imageUrls || car.ImageUrls || []
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching dashboard data...');
        
        const statsResponse = await adminAPI.getStats();
        console.log('📈 Stats response:', statsResponse.data);
        const statsData = statsResponse.data;
        const convertedStats = {
          totalUsers: statsData.totalUsers ?? statsData.TotalUsers ?? 0,
          totalCars: statsData.totalCars ?? statsData.TotalCars ?? 0,
          totalRentals: statsData.totalRentals ?? statsData.TotalRentals ?? 0,
          pendingApprovals: statsData.pendingApprovals ?? statsData.PendingApprovals ?? 0,
          totalMessages: statsData.totalMessages ?? 0,
          unreadMessages: statsData.unreadMessages ?? 0,
          totalRevenue: statsData.totalRevenue ?? 0,
          monthlyRevenue: statsData.monthlyRevenue ?? 0
        };
        setStats(convertedStats);

        console.log('📋 Fetching pending rentals...');
        const rentalsResponse = await adminAPI.getPendingRentals();
        console.log('🚗 Pending rentals:', rentalsResponse.data);
        setRecentRentals(rentalsResponse.data);

      } catch (error) {
        console.error('❌ Dashboard data fetch error:', error);
        console.error('📡 Error details:', error.response);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    console.log('🔐 Admin auth check - Token:', !!token);
    console.log('👤 User:', user);

    if (!token) {
      console.log('❌ No token - redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    const userRole = user?.Role || user?.role;
    if (userRole !== 'Admin') {
      console.log('🚫 Not admin - redirecting to profile');
      navigate('/profile', { replace: true });
      return;
    }

    console.log('✅ Admin access granted');
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    const fetchTabData = async () => {
      try {
        console.log(`🔄 Fetching ${activeTab} data...`);
        
        if (activeTab === 'rentals') {
          const response = await adminAPI.getAllRentals();
          console.log('📋 All rentals:', response.data);
          setAllRentals(response.data);
          setFilteredRentals(response.data);
        } else if (activeTab === 'users') {
          const response = await adminAPI.getUsers();
          console.log('👥 All users:', response.data);
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else if (activeTab === 'cars') {
          const response = await adminAPI.getCars();
          console.log('🚘 All cars RAW DATA:', response.data);
          const normalizedCars = response.data.map(car => normalizeCarData(car));
          console.log('🚘 Normalized cars:', normalizedCars);
          setCars(normalizedCars);
          setFilteredCars(normalizedCars);
        }
      } catch (error) {
        console.error(`❌ Error fetching ${activeTab} data:`, error);
        console.error('📡 Error details:', error.response);
        alert(`Failed to load ${activeTab} data. Please try again.`);
      }
    };

    if (activeTab !== 'dashboard') {
      fetchTabData();
    }
  }, [activeTab]);

  // Search effect
  useEffect(() => {
    if (activeTab === 'rentals') {
      const filtered = allRentals.filter(rental => 
        rental.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.car?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.car?.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRentals(filtered);
      setCurrentPage(1);
    } else if (activeTab === 'users') {
      const filtered = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    } else if (activeTab === 'cars') {
      const filtered = cars.filter(car => 
        car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.carType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.province?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCars(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, activeTab, allRentals, users, cars]);

  // Pagination helpers
  const getCurrentPageItems = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price) || price === 0) {
      return 'R 0.00';
    }
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  const handleApprove = async (rentalId) => {
    try {
      console.log('🔄 Attempting to approve rental:', rentalId);
      
      const response = await rentalsAPI.approve(rentalId);
      console.log('✅ Approval API response:', response.data);
      
      setRecentRentals(prev => prev.filter(r => r.id !== rentalId));
      setAllRentals(prev => prev.map(r => 
        r.id === rentalId ? { ...r, status: 'Approved' } : r
      ));
      
      setStats(prev => ({ 
        ...prev, 
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1) 
      }));
      
      alert('Rental approved successfully!');
    } catch (error) {
      console.error('❌ Approval failed:', error);
      alert('Failed to approve rental. Please try again.');
    }
  };

  const handleReject = async (rentalId) => {
    try {
      console.log('🔄 Attempting to reject rental:', rentalId);
      
      const response = await rentalsAPI.reject(rentalId);
      console.log('✅ Rejection API response:', response.data);
      
      setRecentRentals(prev => prev.filter(r => r.id !== rentalId));
      setAllRentals(prev => prev.map(r => 
        r.id === rentalId ? { ...r, status: 'Rejected' } : r
      ));
      
      setStats(prev => ({ 
        ...prev, 
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1) 
      }));
      
      alert('Rental rejected successfully!');
    } catch (error) {
      console.error('❌ Rejection failed:', error);
      alert('Failed to reject rental. Please try again.');
    }
  };

  const handleViewRental = (rental) => {
    setSelectedRental(rental);
    setShowRentalModal(true);
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setCarForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      carType: '',
      pricePerDay: 0,
      pricePerHour: 0,
      pricePerWeek: 0,
      mileage: 0,
      engine: '',
      province: '',
      description: '',
      isAvailable: true
    });
    setCarImages([]);
    setShowAddCarModal(true);
  };

  const handleEditCar = (car) => {
    console.log('🔄 Editing car:', car);
    
    setEditingCar(car);
    setCarForm({
      make: car.make || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      carType: car.carType || '',
      pricePerDay: car.pricePerDay || 0,
      pricePerHour: car.pricePerHour || 0,
      pricePerWeek: car.pricePerWeek || 0,
      mileage: car.mileage || 0,
      engine: car.engine || '',
      province: car.province || '',
      description: car.description || '',
      isAvailable: car.isAvailable !== undefined ? car.isAvailable : true
    });
    
    let existingImages = [];
    let originalImageUrls = [];
    
    const imageUrls = car.imageUrls;
    if (imageUrls) {
      if (Array.isArray(imageUrls)) {
        originalImageUrls = imageUrls.filter(url => url && typeof url === 'string');
        existingImages = originalImageUrls.map(url => ({
          id: `existing-${url}-${Date.now()}`,
          url: url,
          isExisting: true,
          isNew: false
        }));
      } else if (typeof imageUrls === 'string') {
        try {
          const parsedImages = JSON.parse(imageUrls);
          if (Array.isArray(parsedImages)) {
            originalImageUrls = parsedImages.filter(url => url && typeof url === 'string');
            existingImages = originalImageUrls.map(url => ({
              id: `existing-${url}-${Date.now()}`,
              url: url,
              isExisting: true,
              isNew: false
            }));
          }
        } catch (error) {
          originalImageUrls = [imageUrls];
          existingImages = [{
            id: `existing-${imageUrls}-${Date.now()}`,
            url: imageUrls,
            isExisting: true,
            isNew: false
          }];
        }
      }
    }
    
    car.originalImageUrls = originalImageUrls;
    setCarImages(existingImages);
    setShowAddCarModal(true);
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting car:', carId);
      await adminAPI.deleteCar(carId);
      
      const response = await adminAPI.getCars();
      const normalizedCars = response.data.map(car => normalizeCarData(car));
      setCars(normalizedCars);
      setFilteredCars(normalizedCars);
      
      alert('Car deleted successfully!');
    } catch (error) {
      console.error('❌ Car deletion failed:', error);
      alert('Failed to delete car. Please try again.');
    }
  };

  const handleCarFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const formData = new FormData();
      
      Object.keys(carForm).forEach(key => {
        const value = carForm[key];
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const newImages = carImages.filter(img => img.file && img.isNew);
      const existingImages = carImages.filter(img => img.isExisting && img.url);

      let response;
      if (editingCar) {
        let carId = editingCar.id;
        if (!carId) {
          throw new Error('Car ID not found in editingCar object');
        }

        newImages.forEach(img => {
          if (img.file) {
            formData.append('NewImages', img.file);
          }
        });

        const originalImages = editingCar.originalImageUrls || [];
        const currentImageUrls = existingImages.map(img => img.url);
        const removedImages = originalImages.filter(url => !currentImageUrls.includes(url));
        
        if (removedImages.length > 0) {
          removedImages.forEach(url => {
            formData.append('ImagesToRemove', url);
          });
        }

        response = await adminAPI.updateCar(carId, formData);
        alert('Car updated successfully!');
      } else {
        newImages.forEach(img => {
          if (img.file) {
            formData.append('Images', img.file);
          }
        });

        response = await adminAPI.createCar(formData);
        alert('Car created successfully!');
      }

      const carsResponse = await adminAPI.getCars();
      const normalizedCars = carsResponse.data.map(car => normalizeCarData(car));
      setCars(normalizedCars);
      setFilteredCars(normalizedCars);
      setShowAddCarModal(false);
      resetCarForm();

    } catch (error) {
      console.error('❌ Car form submission failed:', error);
      let errorMessage = 'Failed to save car. ';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage += JSON.stringify(error.response.data);
        } else {
          errorMessage += error.response.data;
        }
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const resetCarForm = () => {
    setCarForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      carType: '',
      pricePerDay: 0,
      pricePerHour: 0,
      pricePerWeek: 0,
      mileage: 0,
      engine: '',
      province: '',
      description: '',
      isAvailable: true
    });
    setCarImages([]);
    setEditingCar(null);
  };

  const handleImagesChange = (images) => {
    setCarImages(images);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getCarImage = (car) => {
    let firstImage = '/images/car-placeholder.webp';
    
    if (car.imageUrls) {
      if (Array.isArray(car.imageUrls)) {
        firstImage = car.imageUrls.length > 0 ? car.imageUrls[0] : '/images/car-placeholder.webp';
      } else if (typeof car.imageUrls === 'string') {
        try {
          const parsedImages = JSON.parse(car.imageUrls);
          firstImage = Array.isArray(parsedImages) && parsedImages.length > 0 
            ? parsedImages[0] 
            : '/images/car-placeholder.webp';
        } catch (error) {
          firstImage = car.imageUrls;
        }
      }
    }
    
    return firstImage;
  };

  const handleToggleAvailability = async (car) => {
    try {
      const updatedCar = { ...car, isAvailable: !car.isAvailable };
      const formData = new FormData();
      
      Object.keys(updatedCar).forEach(key => {
        if (key !== 'imageUrls' && key !== 'id') {
          const value = updatedCar[key];
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      await adminAPI.updateCar(car.id, formData);
      
      // Refresh cars list
      const response = await adminAPI.getCars();
      const normalizedCars = response.data.map(c => normalizeCarData(c));
      setCars(normalizedCars);
      setFilteredCars(normalizedCars);
      
      alert(`Car marked as ${updatedCar.isAvailable ? 'Available' : 'Booked'} successfully!`);
    } catch (error) {
      console.error('❌ Failed to toggle availability:', error);
      alert('Failed to update car status. Please try again.');
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-car text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cars</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCars}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <i className="fas fa-receipt text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRentals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        {/* New Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <i className="fas fa-envelope text-indigo-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
              <p className="text-xs text-gray-500">{stats.unreadMessages} unread</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <i className="fas fa-chart-line text-emerald-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500">This month: {formatPrice(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
              { id: 'rentals', label: 'Manage Rentals', icon: 'car' },
              { id: 'users', label: 'Manage Users', icon: 'users' },
              { id: 'cars', label: 'Manage Cars', icon: 'cog' },
              { id: 'messages', label: 'Messages', icon: 'envelope' },
              { id: 'locations', label: 'Locations', icon: 'map-marker-alt' },
              { id: 'contact', label: 'Contact Info', icon: 'address-book' },
              { id: 'analytics', label: 'Analytics', icon: 'chart-bar' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`fas fa-${tab.icon} mr-2`}></i>
                {tab.label}
                {tab.id === 'messages' && stats.unreadMessages > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Rental Requests</h3>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">
                  {recentRentals.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {recentRentals.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-check-circle text-green-500 text-4xl mb-2"></i>
                    <p className="text-gray-500">No pending rentals at the moment.</p>
                  </div>
                ) : (
                  recentRentals.map(rental => (
                    <div key={rental.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {rental.car?.make} {rental.car?.model} ({rental.car?.year})
                          </h4>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-user mr-1"></i>
                            {rental.user?.firstName} {rental.user?.lastName} ({rental.user?.email})
                          </p>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-calendar mr-1"></i>
                            {rental.pickupDate} to {rental.returnDate}
                          </p>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {rental.pickupLocation} → {rental.dropoffLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(rental.totalAmount)}
                          </p>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleViewRental(rental)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            <button
                              onClick={() => handleApprove(rental.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                            >
                              <i className="fas fa-check mr-1"></i>
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(rental.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              <i className="fas fa-times mr-1"></i>
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Rentals Tab - With Search and Pagination */}
          {activeTab === 'rentals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">All Rentals</h3>
                <div className="flex items-center space-x-4">
                  <SearchBar 
                    placeholder="Search rentals..."
                    onSearch={setSearchTerm}
                    value={searchTerm}
                  />
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-gray-600">ID</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">User</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Car</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Dates</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Amount</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRentals.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                          No rentals found.
                        </td>
                      </tr>
                    ) : (
                      getCurrentPageItems(filteredRentals).map(rental => (
                        <tr key={rental.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{rental.id}</td>
                          <td className="py-2 px-4 border-b">
                            {rental.user?.firstName} {rental.user?.lastName}
                            <br />
                            <span className="text-xs text-gray-500">{rental.user?.email}</span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rental.car?.make} {rental.car?.model}
                            <br />
                            <span className="text-xs text-gray-500">{rental.car?.year} • {rental.car?.carType}</span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rental.pickupDate} to {rental.returnDate}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {getStatusBadge(rental.status)}
                          </td>
                          <td className="py-2 px-4 border-b">{formatPrice(rental.totalAmount)}</td>
                          <td className="py-2 px-4 border-b">
                            <button 
                              onClick={() => handleViewRental(rental)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2 hover:bg-blue-600"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            {rental.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(rental.id)}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2 hover:bg-green-600"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(rental.id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRentals.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Users Tab - With Search and Pagination */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <div className="flex items-center space-x-4">
                  <SearchBar 
                    placeholder="Search users..."
                    onSearch={setSearchTerm}
                    value={searchTerm}
                  />
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-gray-600">ID</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Name</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Email</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Phone</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Role</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      getCurrentPageItems(filteredUsers).map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{user.id}</td>
                          <td className="py-2 px-4 border-b">{user.firstName} {user.lastName}</td>
                          <td className="py-2 px-4 border-b">{user.email}</td>
                          <td className="py-2 px-4 border-b">{user.phoneNumber || 'N/A'}</td>
                          <td className="py-2 px-4 border-b">
                            {getStatusBadge(user.role)}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Cars Tab - With Search and Pagination */}
          {activeTab === 'cars' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Car Management</h3>
                <div className="flex items-center space-x-4">
                  <SearchBar 
                    placeholder="Search cars..."
                    onSearch={setSearchTerm}
                    value={searchTerm}
                  />
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <button
                    onClick={handleAddCar}
                    className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add New Car
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-gray-600">Image</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Make & Model</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Year</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Type</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Price/Day</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                          No cars found.
                        </td>
                      </tr>
                    ) : (
                      getCurrentPageItems(filteredCars).map(car => (
                        <tr key={car.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">
                            <img
                              src={getCarImage(car)}
                              alt={`${car.make} ${car.model}`}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                e.target.src = '/images/car-placeholder.webp';
                              }}
                            />
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="font-medium">{car.make} {car.model}</div>
                            <div className="text-xs text-gray-500">{car.engine}</div>
                          </td>
                          <td className="py-2 px-4 border-b">{car.year}</td>
                          <td className="py-2 px-4 border-b">{car.carType}</td>
                          <td className="py-2 px-4 border-b">
                            {car.pricePerDay > 0 ? formatPrice(car.pricePerDay) : 'N/A'}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <button
                              onClick={() => handleToggleAvailability(car)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                car.isAvailable 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {car.isAvailable ? 'Available' : 'Booked'}
                            </button>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <button 
                              onClick={() => handleEditCar(car)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2 hover:bg-blue-600"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCar(car.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredCars.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <MessagesManager 
              stats={stats}
              setStats={setStats}
            />
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <LocationsManager />
          )}

          {/* Contact Info Tab */}
          {activeTab === 'contact' && (
            <ContactInfoManager />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              rentals={allRentals}
              users={users}
              cars={cars}
              stats={stats}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Car Modal */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCar ? 'Edit Car' : 'Add New Car'}
                </h2>
                <button
                  onClick={() => setShowAddCarModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleCarFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Make</label>
                    <input
                      type="text"
                      value={carForm.make}
                      onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <input
                      type="text"
                      value={carForm.model}
                      onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      value={carForm.year || ''}
                      onChange={(e) => setCarForm({ ...carForm, year: e.target.value ? parseInt(e.target.value) : '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Car Type</label>
                    <select
                      value={carForm.carType}
                      onChange={(e) => setCarForm({ ...carForm, carType: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">Select Type</option>
                      {CAR_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Day (R)</label>
                    <input
                      type="number"
                      value={carForm.pricePerDay || ''}
                      onChange={(e) => setCarForm({ ...carForm, pricePerDay: e.target.value ? parseFloat(e.target.value) : '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Hour (R)</label>
                    <input
                      type="number"
                      value={carForm.pricePerHour || ''}
                      onChange={(e) => setCarForm({ ...carForm, pricePerHour: e.target.value ? parseFloat(e.target.value) : '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Week (R)</label>
                    <input
                      type="number"
                      value={carForm.pricePerWeek || ''}
                      onChange={(e) => setCarForm({ ...carForm, pricePerWeek: e.target.value ? parseFloat(e.target.value) : '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mileage (km)</label>
                    <input
                      type="number"
                      value={carForm.mileage || ''}
                      onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value ? parseInt(e.target.value) : '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Engine</label>
                    <input
                      type="text"
                      value={carForm.engine}
                      onChange={(e) => setCarForm({ ...carForm, engine: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      placeholder="e.g., V6, Electric, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <select
                      value={carForm.province}
                      onChange={(e) => setCarForm({ ...carForm, province: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={carForm.isAvailable}
                        onChange={(e) => setCarForm({ ...carForm, isAvailable: e.target.checked })}
                        className="h-4 w-4 text-amber-500 rounded"
                      />
                      <span className="text-sm text-gray-700">Available for Rent</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={carForm.description}
                    onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Images (Max 5)</label>
                  <ImageUpload 
                    images={carImages} 
                    onImagesChange={handleImagesChange} 
                    maxImages={5}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddCarModal(false); resetCarForm(); }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`px-4 py-2 rounded text-white ${
                      formLoading ? 'bg-gray-400' : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {formLoading ? 'Saving...' : editingCar ? 'Update Car' : 'Add Car'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rental Details Modal */}
      {showRentalModal && selectedRental && (
        <RentalDetailsModal
          rental={selectedRental}
          onClose={() => setShowRentalModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
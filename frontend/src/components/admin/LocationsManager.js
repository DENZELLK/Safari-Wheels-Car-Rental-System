import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../../services/api';
import { PROVINCES } from '../../utils/constants';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

const LocationsManager = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    province: '',
    cities: [],
    address: '',
    phone: '',
    hours: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    isActive: true
  });

  const [cityInput, setCityInput] = useState('');

  // Fetch locations
  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter locations based on search
  useEffect(() => {
    const filtered = locations.filter(loc => 
      loc.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.cities?.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLocations(filtered);
    setCurrentPage(1);
  }, [searchTerm, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await locationsAPI.getAll();
      console.log('📥 Locations loaded:', response.data);
      
      setLocations(response.data);
      setFilteredLocations(response.data);
      
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
      setError(error.response?.data?.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.province) {
      errors.province = 'Province is required';
    }

    if (formData.cities.length === 0) {
      errors.cities = 'At least one city is required';
    }

    if (!formData.address) {
      errors.address = 'Address is required';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.hours) {
      errors.hours = 'Operating hours are required';
    }

    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      errors.coordinates = 'Both latitude and longitude are required';
    } else {
      const lat = parseFloat(formData.coordinates.lat);
      const lng = parseFloat(formData.coordinates.lng);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.lat = 'Latitude must be between -90 and 90';
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.lng = 'Longitude must be between -180 and 180';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      province: '',
      cities: [],
      address: '',
      phone: '',
      hours: '',
      coordinates: { lat: '', lng: '' },
      isActive: true
    });
    setCityInput('');
    setValidationErrors({});
    setShowModal(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setFormData({
      province: location.province,
      cities: location.cities || [],
      address: location.address,
      phone: location.phone,
      hours: location.hours,
      coordinates: {
        lat: location.coordinates?.lat?.toString() || '',
        lng: location.coordinates?.lng?.toString() || ''
      },
      isActive: location.isActive
    });
    setCityInput('');
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }
    
    try {
      await locationsAPI.delete(locationId);
      
      // Show success message
      setSuccessMessage('Location deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh locations
      await fetchLocations();
      
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      alert(error.response?.data?.message || 'Failed to delete location. Please try again.');
    }
  };

  const handleToggleActive = async (locationId, currentStatus) => {
    try {
      await locationsAPI.toggleActive(locationId);
      
      // Update local state
      setLocations(prev => prev.map(loc => 
        loc.id === locationId ? { ...loc, isActive: !currentStatus } : loc
      ));
      
      setSuccessMessage(`Location ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Error toggling location status:', error);
      alert(error.response?.data?.message || 'Failed to update location status. Please try again.');
    }
  };

  const handleAddCity = () => {
    if (cityInput.trim()) {
      const city = cityInput.trim();
      if (!formData.cities.includes(city)) {
        setFormData({
          ...formData,
          cities: [...formData.cities, city]
        });
        setCityInput('');
        
        // Clear city validation error if any
        if (validationErrors.cities) {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.cities;
            return newErrors;
          });
        }
      } else {
        alert('This city has already been added');
      }
    }
  };

  const handleRemoveCity = (cityToRemove) => {
    setFormData({
      ...formData,
      cities: formData.cities.filter(city => city !== cityToRemove)
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCoordinateChange = (coord, value) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [coord]: value
      }
    }));

    // Clear coordinate validation errors
    if (validationErrors[coord] || validationErrors.coordinates) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[coord];
        delete newErrors.coordinates;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const locationData = {
        province: formData.province,
        cities: formData.cities,
        address: formData.address,
        phone: formData.phone,
        hours: formData.hours,
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        },
        isActive: formData.isActive
      };

      if (editingLocation) {
        // Update existing location
        await locationsAPI.update(editingLocation.id, locationData);
        setSuccessMessage('Location updated successfully!');
      } else {
        // Create new location
        await locationsAPI.create(locationData);
        setSuccessMessage('Location created successfully!');
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh locations list
      await fetchLocations();
      
      // Close modal
      setShowModal(false);
      
    } catch (error) {
      console.error('❌ Error saving location:', error);
      setError(error.response?.data?.message || 'Failed to save location. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Location Management</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-amber-600 hover:text-amber-700 text-sm flex items-center"
            title="Refresh"
          >
            <i className={`fas fa-sync-alt mr-1 ${refreshing ? 'fa-spin' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <SearchBar 
            placeholder="Search locations..."
            onSearch={setSearchTerm}
            value={searchTerm}
            delay={500}
          />
          
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          
          <button
            onClick={handleAddLocation}
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Location
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
          <i className="fas fa-check-circle mr-3 mt-1"></i>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
          <i className="fas fa-exclamation-circle mr-3 mt-1"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-map-marker-alt text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-green-600">
                {locations.filter(loc => loc.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Provinces Covered</p>
              <p className="text-2xl font-bold text-amber-600">
                {new Set(locations.map(loc => loc.province)).size}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <i className="fas fa-globe-africa text-amber-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-map-marked-alt text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-500 text-lg">No locations found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Click "Add Location" to create your first location'}
            </p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageItems().map(location => (
                  <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {location.province}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {location.cities?.slice(0, 3).map((city, idx) => (
                          <span 
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {city}
                          </span>
                        ))}
                        {location.cities?.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            +{location.cities.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {location.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {location.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(location.id, location.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          location.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {location.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredLocations.length)} of{' '}
                  {filteredLocations.length} locations
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredLocations.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        validationErrors.province ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {validationErrors.province && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.province}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cities <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter city name and press Add"
                      />
                      <button
                        type="button"
                        onClick={handleAddCity}
                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                      >
                        Add City
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-md bg-gray-50">
                      {formData.cities.map((city, index) => (
                        <span
                          key={index}
                          className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => handleRemoveCity(city)}
                            className="ml-2 text-amber-600 hover:text-amber-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      ))}
                      {formData.cities.length === 0 && (
                        <span className="text-gray-400 text-sm">No cities added yet</span>
                      )}
                    </div>
                    {validationErrors.cities && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.cities}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        validationErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main Street, City"
                      required
                    />
                    {validationErrors.address && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+27 11 123 4567"
                      required
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operating Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        validationErrors.hours ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM"
                      required
                    />
                    {validationErrors.hours && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.hours}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lat}
                      onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        validationErrors.lat ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="-26.107"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lng}
                      onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        validationErrors.lng ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="28.056"
                      required
                    />
                  </div>
                  {(validationErrors.lat || validationErrors.lng || validationErrors.coordinates) && (
                    <p className="text-red-500 text-xs mt-1 col-span-2">
                      {validationErrors.lat || validationErrors.lng || validationErrors.coordinates}
                    </p>
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">Location is active (visible on website)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center ${
                      formLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {formLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {editingLocation ? 'Update Location' : 'Add Location'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsManager;
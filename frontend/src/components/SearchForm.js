import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROVINCES, CAR_TYPES } from '../utils/constants';

const SearchForm = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    carType: '',
    maxPrice: '',
    carName: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!searchData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!searchData.returnDate) newErrors.returnDate = 'Return date is required';
    if (searchData.pickupDate && searchData.returnDate && new Date(searchData.pickupDate) >= new Date(searchData.returnDate)) {
      newErrors.returnDate = 'Return date must be after pickup date';
    }
    if (searchData.maxPrice && (searchData.maxPrice <= 0 || searchData.maxPrice > 10000)) {
      newErrors.maxPrice = 'Max price must be between 1 and 10000 ZAR';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Navigate to cars page with search parameters
    const queryParams = new URLSearchParams();
    Object.keys(searchData).forEach(key => {
      if (searchData[key]) {
        queryParams.append(key, searchData[key]);
      }
    });
    navigate(`/cars?${queryParams.toString()}`);
  };

  const clearFilters = () => {
    setSearchData({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: '',
      returnDate: '',
      carType: '',
      maxPrice: '',
      carName: ''
    });
    setErrors({});
    navigate('/cars');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="pickupLocation" className="block text-gray-700 mb-2 font-medium">
              Pickup Location
            </label>
            <select 
              id="pickupLocation"
              name="pickupLocation" 
              value={searchData.pickupLocation}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Select pickup province"
            >
              <option value="">Any Province</option>
              {PROVINCES.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dropoffLocation" className="block text-gray-700 mb-2 font-medium">
              Dropoff Location
            </label>
            <select 
              id="dropoffLocation"
              name="dropoffLocation" 
              value={searchData.dropoffLocation}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Select dropoff province"
            >
              <option value="">Any Province</option>
              {PROVINCES.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="pickupDate" className="block text-gray-700 mb-2 font-medium">
              Pickup Date *
            </label>
            <input 
              type="date" 
              id="pickupDate"
              name="pickupDate" 
              value={searchData.pickupDate}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'}`}
              aria-label="Select pickup date"
              required
            />
            {errors.pickupDate && <p className="text-red-500 text-sm mt-1">{errors.pickupDate}</p>}
          </div>
          
          <div>
            <label htmlFor="returnDate" className="block text-gray-700 mb-2 font-medium">
              Return Date *
            </label>
            <input 
              type="date" 
              id="returnDate"
              name="returnDate" 
              value={searchData.returnDate}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.returnDate ? 'border-red-500' : 'border-gray-300'}`}
              aria-label="Select return date"
              required
            />
            {errors.returnDate && <p className="text-red-500 text-sm mt-1">{errors.returnDate}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="carType" className="block text-gray-700 mb-2 font-medium">
              Car Type
            </label>
            <select 
              id="carType"
              name="carType" 
              value={searchData.carType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Select car type"
            >
              <option value="">Any Type</option>
              {CAR_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="maxPrice" className="block text-gray-700 mb-2 font-medium">
              Max Daily Price (ZAR)
            </label>
            <input 
              type="number" 
              id="maxPrice"
              name="maxPrice" 
              value={searchData.maxPrice}
              onChange={handleChange}
              placeholder="e.g. 1500"
              min="1"
              max="10000"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.maxPrice ? 'border-red-500' : 'border-gray-300'}`}
              aria-label="Enter maximum daily price"
            />
            {errors.maxPrice && <p className="text-red-500 text-sm mt-1">{errors.maxPrice}</p>}
          </div>
          
          <div>
            <label htmlFor="carName" className="block text-gray-700 mb-2 font-medium">
              Car Name
            </label>
            <input 
              type="text" 
              id="carName"
              name="carName" 
              value={searchData.carName}
              onChange={handleChange}
              placeholder="e.g. BMW, Mercedes"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Enter car make or model"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            type="submit" 
            disabled={Object.keys(errors).length > 0}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 px-4 rounded-md transition-colors"
            aria-label="Search available cars"
          >
            Search Available Cars
          </button>
          <button 
            type="button"
            onClick={clearFilters}
            className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
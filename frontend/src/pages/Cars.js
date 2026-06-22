import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import CarCard from '../components/CarCard';
import { carsAPI } from '../services/api';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        
        const filters = {
          pickupLocation: searchParams.get('pickupLocation'),
          carType: searchParams.get('carType'),
          maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : undefined,
          carName: searchParams.get('carName')
        };

        console.log('🚀 Starting to fetch cars...');
        console.log('📡 API Filters:', filters);
        
        const response = await carsAPI.getAll(filters);
        console.log('✅ API Response received:', response);
        console.log('📊 Response data type:', typeof response.data);
        console.log('🔢 Response data length:', response.data?.length);
        
        if (response.data && response.data.length > 0) {
          console.log('🎉 Cars data received successfully!');
          console.log('📋 First car details:', response.data[0]);
          console.log('💰 First car prices:', {
            pricePerDay: response.data[0].pricePerDay,
            pricePerHour: response.data[0].pricePerHour,
            pricePerWeek: response.data[0].pricePerWeek,
            types: {
              pricePerDay: typeof response.data[0].pricePerDay,
              pricePerHour: typeof response.data[0].pricePerHour,
              pricePerWeek: typeof response.data[0].pricePerWeek
            }
          });
        } else {
          console.warn('⚠️ No cars data received or empty array');
        }
        
        setCars(response.data || []);
        setFilteredCars(response.data || []);
      } catch (error) {
        console.error('❌ Error fetching cars:', error);
        console.error('🔧 Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError('Failed to load cars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [searchParams]);

  // Test function to check API directly
  const testDirectAPI = async () => {
    try {
      console.log('🧪 Testing direct API call...');
      const response = await fetch('/api/cars');
      console.log('📡 Direct fetch response:', response);
      const data = await response.json();
      console.log('📊 Direct fetch data:', data);
    } catch (error) {
      console.error('❌ Direct API test failed:', error);
    }
  };

  // Call test on component mount
  useEffect(() => {
    testDirectAPI();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading luxury cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Luxury Fleet</h1>
          <p className="text-gray-600">Discover the finest cars available across South Africa</p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <SearchForm />
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredCars.length} of {cars.length} cars
          </p>
          <div>
            <label htmlFor="sortSelect" className="sr-only">Sort cars by</label>
            <select 
              id="sortSelect"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-car text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
            <button 
              onClick={() => window.location.href = '/cars'}
              className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
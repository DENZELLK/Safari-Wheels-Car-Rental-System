import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PROVINCES } from '../utils/constants';

const CarCard = ({ car }) => {
  // All hooks must be called at the top level, before any conditionals
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rentalData, setRentalData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    proofOfAddress: null,
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [extraCharge, setExtraCharge] = useState(0);
  const [errors, setErrors] = useState({});

  // Early return if car is undefined or null - must be AFTER all hooks
  if (!car) {
    console.warn('🚫 CarCard received undefined car prop');
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Use PascalCase properties from backend (fallback to camelCase)
  const carId = car.Id || car.id;
  const make = car.Make || car.make;
  const model = car.Model || car.model;
  const year = car.Year || car.year;
  const carType = car.CarType || car.carType;
  const pricePerDay = car.PricePerDay || car.pricePerDay;
  const pricePerHour = car.PricePerHour || car.pricePerHour;
  const pricePerWeek = car.PricePerWeek || car.pricePerWeek;
  const mileage = car.Mileage || car.mileage;
  const engine = car.Engine || car.engine;
  const province = car.Province || car.province;
  const description = car.Description || car.description;
  const imageUrls = car.ImageUrls || car.imageUrls;
  const isAvailable = car.IsAvailable !== undefined ? car.IsAvailable : car.isAvailable;
  const averageRating = car.AverageRating || car.averageRating;

  // Initialize totalAmount with car price after we know car exists
  if (totalAmount === 0 && pricePerDay) {
    setTotalAmount(Number(pricePerDay) || 0);
  }

  console.log('🚗 CarCard rendering with car:', car);
  console.log('💰 Car prices - PascalCase:', {
    PricePerDay: car.PricePerDay,
    PricePerHour: car.PricePerHour,
    PricePerWeek: car.PricePerWeek
  });
  console.log('💰 Car prices - camelCase:', {
    pricePerDay: car.pricePerDay,
    pricePerHour: car.pricePerHour,
    pricePerWeek: car.pricePerWeek
  });
  console.log('🎯 Using prices:', {
    pricePerDay,
    pricePerHour,
    pricePerWeek
  });

  // FIXED: Handle imageUrls properly - don't parse JSON if it's already an array
  let images = [];
  let mainImage = '/images/car-placeholder.webp';

  if (imageUrls) {
    if (Array.isArray(imageUrls)) {
      // It's already an array - use directly
      images = imageUrls;
    } else if (typeof imageUrls === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(imageUrls);
        if (Array.isArray(parsed)) {
          images = parsed;
        } else {
          // If it's a single URL string
          images = [imageUrls];
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse imageUrls as JSON, using as single URL:', imageUrls);
        // If parsing fails, treat it as a single URL
        images = [imageUrls];
      }
    }
  }

  // Get main image
  if (images.length > 0) {
    mainImage = images[0];
  }

  console.log('🖼️ Processed images:', images);

  const formatPrice = (price) => {
    console.log('💰 Formatting price:', price, 'Type:', typeof price);
    
    // Handle null/undefined/NaN values
    if (price === null || price === undefined || price === '' || isNaN(price)) {
      console.warn('⚠️ Invalid price value:', price, 'for car:', make, model);
      return 'R 0';
    }
    
    // Ensure it's a number
    const priceNumber = Number(price);
    
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceNumber);
  };

  const calculateTotal = () => {
    const dailyPrice = Number(pricePerDay) || 0;
    
    if (!rentalData.pickupDate || !rentalData.returnDate) return dailyPrice;

    const pickup = new Date(rentalData.pickupDate);
    const returnD = new Date(rentalData.returnDate);
    if (pickup >= returnD) return dailyPrice;

    const days = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
    let baseTotal = dailyPrice * days;

    // Extra charge if different provinces (20% fee)
    if (rentalData.pickupLocation && rentalData.dropoffLocation && rentalData.pickupLocation !== rentalData.dropoffLocation) {
      const fee = baseTotal * 0.2;
      setExtraCharge(fee);
      return baseTotal + fee;
    }

    setExtraCharge(0);
    return baseTotal;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proofOfAddress' && files[0]) {
      setRentalData((prev) => ({ ...prev, proofOfAddress: files[0] }));
    } else {
      setRentalData((prev) => ({ ...prev, [name]: value }));
    }

    // Recalculate total on date/location change
    if (name === 'pickupDate' || name === 'returnDate' || name === 'pickupLocation' || name === 'dropoffLocation') {
      setTotalAmount(calculateTotal());
    }

    // Clear errors
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!rentalData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!rentalData.returnDate) newErrors.returnDate = 'Return date is required';
    if (rentalData.pickupDate && rentalData.returnDate && new Date(rentalData.pickupDate) >= new Date(rentalData.returnDate)) {
      newErrors.returnDate = 'Return date must be after pickup date';
    }
    if (!rentalData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
    if (!rentalData.dropoffLocation) newErrors.dropoffLocation = 'Dropoff location is required';
    if (!rentalData.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
  const token = localStorage.getItem('token');
  
  // ✅ Check if user is logged in
  if (!token) {
    alert('Please log in to make a booking.');
    window.location.href = '/login'; // or open a login modal if you have one
    return;
  }

  const formData = new FormData();
  formData.append('carId', carId);
  formData.append('pickupDate', rentalData.pickupDate);
  formData.append('returnDate', rentalData.returnDate);
  formData.append('pickupLocation', rentalData.pickupLocation);
  formData.append('dropoffLocation', rentalData.dropoffLocation);
  formData.append('totalAmount', totalAmount);
  if (rentalData.proofOfAddress) formData.append('proofOfAddress', rentalData.proofOfAddress);

  try {
    const response = await fetch('/api/rentals', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 401) {
      alert('Session expired or unauthorized. Please log in again.');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Booking failed');
    }

    const data = await response.json();
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setShowModal(false);
      window.location.href = '/profile';
    }, 3000);
  } catch (error) {
    console.error('Booking error:', error);
    alert(`Booking failed: ${error.message}`);
  }
};


  const closeModal = () => {
    setShowModal(false);
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setRentalData({
      pickupDate: '',
      returnDate: '',
      pickupLocation: '',
      dropoffLocation: '',
      proofOfAddress: null,
    });
    setErrors({});
    setExtraCharge(0);
    setTotalAmount(Number(pricePerDay) || 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={mainImage}
          alt={`${make} ${model}`}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
        />
        {!isAvailable && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
            Booked
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-white font-bold text-xl">
            {make} {model}
          </h3>
          <p className="text-amber-300">{year} • {carType}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-bold text-amber-600">
            {formatPrice(pricePerDay)}
            <span className="text-sm text-gray-500">/day</span>
          </div>
          <div className="flex space-x-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <i
                key={`${carId}-star-${i}`}
                className={`fas fa-star ${
                  i < Math.floor(averageRating || 0) ? 'text-amber-500' : 'text-gray-300'
                }`}
              ></i>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <i className="fas fa-tachometer-alt mr-2 text-amber-500"></i>
            <span>{(mileage ?? 0).toLocaleString()} km</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-cog mr-2 text-amber-500"></i>
            <span>{engine || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-map-marker-alt mr-2 text-amber-500"></i>
            <span>{province || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-car mr-2 text-amber-500"></i>
            <span>{carType}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex justify-between items-center">
          <Link
            to={`/cars/${carId}`}
            className="text-amber-500 hover:text-amber-600 font-medium flex items-center"
          >
            View Details
            <i className="fas fa-chevron-right ml-1 text-xs"></i>
          </Link>

          <button
            onClick={() => setShowModal(true)}
            disabled={!isAvailable}
            className={`px-4 py-2 rounded-md font-medium ${
              isAvailable
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            {isAvailable ? 'Rent Now' : 'Not Available'}
          </button>
        </div>

        {/* Price options */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Hourly: {formatPrice(pricePerHour)}</span>
            <span>Weekly: {formatPrice(pricePerWeek)}</span>
          </div>
        </div>
      </div>

      {/* Rental Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Rent {make} {model}</h2>
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="pickupDate" className="block text-gray-700 mb-2 font-medium">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={rentalData.pickupDate}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.pickupDate ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      value={rentalData.returnDate}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.returnDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.returnDate && <p className="text-red-500 text-sm mt-1">{errors.returnDate}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-gray-700 mb-2 font-medium">
                      Pickup Location *
                    </label>
                    <select
                      id="pickupLocation"
                      name="pickupLocation"
                      value={rentalData.pickupLocation}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.pickupLocation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.pickupLocation && <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>}
                  </div>

                  <div>
                    <label htmlFor="dropoffLocation" className="block text-gray-700 mb-2 font-medium">
                      Dropoff Location *
                    </label>
                    <select
                      id="dropoffLocation"
                      name="dropoffLocation"
                      value={rentalData.dropoffLocation}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.dropoffLocation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.dropoffLocation && <p className="text-red-500 text-sm mt-1">{errors.dropoffLocation}</p>}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="proofOfAddress" className="block text-gray-700 mb-2 font-medium">
                    Upload Proof of Address *
                  </label>
                  <input
                    type="file"
                    id="proofOfAddress"
                    name="proofOfAddress"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.proofOfAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.proofOfAddress && <p className="text-red-500 text-sm mt-1">{errors.proofOfAddress}</p>}
                  <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG</p>
                </div>

                {extraCharge > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-6">
                    <p>
                      <strong>Extra Charge:</strong> Different provinces detected. 20% inter-province fee applied:{' '}
                      {formatPrice(extraCharge)}
                    </p>
                  </div>
                )}

                <div className="text-right mb-6">
                  <p className="text-xl font-bold text-amber-600">Total: {formatPrice(totalAmount)}</p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={Object.keys(errors).length > 0}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Booking</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>
                <strong>Car:</strong> {make} {model} ({year})
              </p>
              <p>
                <strong>Dates:</strong> {rentalData.pickupDate} to {rentalData.returnDate}
              </p>
              <p>
                <strong>Locations:</strong> {rentalData.pickupLocation} → {rentalData.dropoffLocation}
              </p>
              <p>
                <strong>Total:</strong> {formatPrice(totalAmount)}{' '}
                {extraCharge > 0 && `(incl. ${formatPrice(extraCharge)} fee)`}
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Edit
              </button>
              <button
                onClick={confirmBooking}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
            <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
            <p className="text-lg text-gray-800">Booking submitted successfully!</p>
            <p className="text-sm text-gray-600">Redirecting to profile...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarCard;
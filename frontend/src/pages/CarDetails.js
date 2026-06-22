import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { carsAPI } from '../services/api';
import { PROVINCES } from '../utils/constants';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [rentalLoading, setRentalLoading] = useState(false);

  // Helper function to normalize car data (handle both camelCase and PascalCase)
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
      imageUrls: car.imageUrls || car.ImageUrls || [],
      averageRating: car.averageRating || car.AverageRating || 0
    };
  };

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await carsAPI.getById(id);
        console.log('🚗 Car details RAW DATA:', response.data);
        
        // Normalize the car data
        const normalizedCar = normalizeCarData(response.data);
        console.log('🚗 Normalized car data:', normalizedCar);
        
        setCar(normalizedCar);
        // Initialize total amount with daily price
        setTotalAmount(normalizedCar.pricePerDay || 0);
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Car not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // Helper function to get car image
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

  // Format price function
  const formatPrice = (price) => {
    // Handle NaN, null, undefined, or zero values
    if (!price || isNaN(price) || price === 0) {
      return 'R 0.00';
    }
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  const calculateTotal = () => {
    if (!car) return 0;
    
    const dailyPrice = Number(car.pricePerDay) || 0;
    
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

  const handleRentNow = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      alert('Please log in to rent a car.');
      navigate('/login');
      return;
    }

    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    const token = localStorage.getItem('token');
    
    // Check if user is logged in
    if (!token) {
      alert('Please log in to make a booking.');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('carId', car.id);
    formData.append('pickupDate', rentalData.pickupDate);
    formData.append('returnDate', rentalData.returnDate);
    formData.append('pickupLocation', rentalData.pickupLocation);
    formData.append('dropoffLocation', rentalData.dropoffLocation);
    formData.append('totalAmount', totalAmount);
    if (rentalData.proofOfAddress) formData.append('proofOfAddress', rentalData.proofOfAddress);

    try {
      setRentalLoading(true);
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        alert('Session expired or unauthorized. Please log in again.');
        navigate('/login');
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
        navigate('/profile');
      }, 3000);
    } catch (error) {
      console.error('Booking error:', error);
      alert(`Booking failed: ${error.message}`);
    } finally {
      setRentalLoading(false);
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
    setTotalAmount(car?.pricePerDay || 0);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !car) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link to="/cars" className="text-amber-500 hover:text-amber-600 mb-4 inline-block">
          ← Back to Fleet
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img 
                src={getCarImage(car)}
                alt={`${car.make} ${car.model}`}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/images/car-placeholder.webp';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{car.make} {car.model}</h1>
              <p className="text-amber-600 text-xl mb-2">{car.year} • {car.carType}</p>
              <p className="text-3xl font-bold text-amber-500 mb-4">
                {car.pricePerDay > 0 ? formatPrice(car.pricePerDay) + '/day' : 'Price not available'}
              </p>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star ${i < Math.floor(car.averageRating) ? 'text-amber-500' : 'text-gray-300'}`}
                    ></i>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({car.averageRating > 0 ? car.averageRating.toFixed(1) : 'No ratings'})
                </span>
              </div>
              <p className="text-gray-600 mb-6">{car.description || 'No description available.'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <i className="fas fa-tachometer-alt mr-2 text-amber-500"></i>
                  {car.mileage > 0 ? car.mileage.toLocaleString() + ' km' : 'N/A'}
                </div>
                <div>
                  <i className="fas fa-cog mr-2 text-amber-500"></i>
                  {car.engine || 'N/A'}
                </div>
                <div>
                  <i className="fas fa-map-marker-alt mr-2 text-amber-500"></i>
                  {car.province || 'N/A'}
                </div>
                <div>
                  <i className="fas fa-car mr-2 text-amber-500"></i>
                  {car.carType || 'N/A'}
                </div>
              </div>
              
              {/* Price options */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Hourly: {formatPrice(car.pricePerHour)}</span>
                  <span>Weekly: {formatPrice(car.pricePerWeek)}</span>
                </div>
              </div>

              {car.isAvailable ? (
                <button 
                  onClick={handleRentNow}
                  className="w-full bg-amber-500 text-white py-3 px-6 rounded-md hover:bg-amber-600 transition-colors font-medium text-lg"
                >
                  Rent Now
                </button>
              ) : (
                <div className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-md text-center font-medium">
                  Not Available
                </div>
              )}
              
              {/* Additional rental info */}
              <div className="mt-4 text-sm text-gray-500">
                <p><i className="fas fa-info-circle mr-2"></i>Requires admin approval</p>
                <p><i className="fas fa-clock mr-2"></i>Instant booking confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Rent {car.make} {car.model}</h2>
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
                <strong>Car:</strong> {car.make} {car.model} ({car.year})
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
                disabled={rentalLoading}
                className={`px-4 py-2 rounded-md ${
                  rentalLoading 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {rentalLoading ? 'Processing...' : 'Confirm & Submit'}
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

export default CarDetails;
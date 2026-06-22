import axios from 'axios';

// Use direct connection to backend - we know this works
const API_BASE_URL = 'https://localhost:7056/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request to:', config.baseURL + config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received for:', response.config.url);
    console.log('📊 Response status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error for:', error.config?.url);
    console.error('🔧 Error status:', error.response?.status);
    console.error('🔧 Error message:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Cars endpoints
export const carsAPI = {
  getAll: (filters = {}) => {
    console.log('📡 Fetching cars with filters:', filters);
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/cars?${params.toString()}`);
  },
  getById: (id) => api.get(`/cars/${id}`),
  getFeatured: () => api.get('/cars/featured'),
  
  create: (carData) => {
    if (carData instanceof FormData) {
      return api.post('/cars', carData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.post('/cars', carData);
    }
  },
  
  update: (id, carData) => {
    if (carData instanceof FormData) {
      return api.put(`/cars/${id}`, carData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put(`/cars/${id}`, carData);
    }
  },
  
  delete: (id) => api.delete(`/cars/${id}`),
  toggleAvailability: (id, isAvailable) => api.patch(`/cars/${id}/availability`, { isAvailable }),
};

// Rentals endpoints
export const rentalsAPI = {
  getAll: () => api.get('/rentals'),
  getById: (id) => api.get(`/rentals/${id}`),
  create: (rentalData) => {
    const formData = new FormData();
    Object.keys(rentalData).forEach((key) => {
      if (rentalData[key] !== null && rentalData[key] !== undefined) {
        formData.append(key, rentalData[key]);
      }
    });
    return api.post('/rentals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, rentalData) => api.put(`/rentals/${id}`, rentalData),
  getUserRentals: () => api.get('/rentals/my-rentals'),
  approve: (id) => api.put(`/rentals/${id}/approve`),
  reject: (id) => api.put(`/rentals/${id}/reject`),
  complete: (id) => api.put(`/rentals/${id}/complete`),
};

// Reviews endpoints
export const reviewsAPI = {
  getByCar: (carId) => api.get(`/reviews/car/${carId}`),
  create: (reviewData) => api.post('/reviews', reviewData),
  getUserReviews: () => api.get('/reviews/my-reviews'),
};

// ============================================
// ADMIN MESSAGES API Endpoints
// ============================================
export const adminMessagesAPI = {
  // Get all messages (admin only)
  getAll: () => api.get('/messages'),
  
  // Get single message
  getById: (id) => api.get(`/messages/${id}`),
  
  // Mark message as read
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  
  // Reply to message (admin)
  reply: (replyData) => api.post('/messages/reply', replyData),
  
  // Delete message
  delete: (id) => api.delete(`/messages/${id}`),
  
  // Get unread count
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// ============================================
// USER MESSAGES API Endpoints (NEW)
// ============================================
export const userMessagesAPI = {
  // Get all messages for logged-in user
  getMyMessages: () => api.get('/messages/my-messages'),
  
  // Get unread count for user
  getMyUnreadCount: () => api.get('/messages/my-messages/unread-count'),
  
  // Create new message as authenticated user
  create: (messageData) => api.post('/messages/user-message', messageData),
  
  // Reply to a conversation as user
  reply: (messageId, reply) => api.post('/messages/user-reply', { messageId, reply }),
  
  // Get full conversation thread
  getConversation: (messageId) => api.get(`/messages/conversation/${messageId}`),
};

// ============================================
// PUBLIC CONTACT API Endpoint
// ============================================
export const contactAPI = {
  // Send message via contact form (public)
  sendContactMessage: (messageData) => api.post('/messages/contact', messageData),
  
  // Get contact information (public)
  getInfo: () => api.get('/contactinfo'),
  
  // Update contact information (admin only)
  updateInfo: (contactData) => api.put('/contactinfo', contactData),
};

// ============================================
// Locations API Endpoints
// ============================================
export const locationsAPI = {
  // Get all locations (public)
  getAll: () => api.get('/locations'),
  
  // Get single location
  getById: (id) => api.get(`/locations/${id}`),
  
  // Get locations by province
  getByProvince: (province) => api.get(`/locations/province/${province}`),
  
  // Create new location (admin only)
  create: (locationData) => api.post('/locations', locationData),
  
  // Update location (admin only)
  update: (id, locationData) => api.put(`/locations/${id}`, locationData),
  
  // Toggle location active status
  toggleActive: (id) => api.patch(`/locations/${id}/toggle`),
  
  // Delete location (admin only)
  delete: (id) => api.delete(`/locations/${id}`),
};

// ============================================
// Analytics API Endpoints
// ============================================
export const analyticsAPI = {
  // Get dashboard summary
  getDashboardSummary: () => api.get('/analytics/dashboard-summary'),
  
  // Get revenue data
  getRevenue: (period = 'month') => api.get(`/analytics/revenue?period=${period}`),
  
  // Get bookings data
  getBookings: (period = 'month') => api.get(`/analytics/bookings?period=${period}`),
  
  // Get popular cars
  getPopularCars: (limit = 5) => api.get(`/analytics/popular-cars?limit=${limit}`),
  
  // Get popular locations
  getPopularLocations: (limit = 5) => api.get(`/analytics/popular-locations?limit=${limit}`),
  
  // Get user growth
  getUserGrowth: (period = 'month') => api.get(`/analytics/user-growth?period=${period}`),
  
  // Get car type distribution
  getCarTypeDistribution: () => api.get('/analytics/car-types'),
};

// Enhanced adminAPI with all admin endpoints
export const adminAPI = {
  // Existing admin endpoints
  getStats: () => api.get('/admin/stats'),
  getPendingRentals: () => api.get('/admin/pending-rentals'),
  getAllRentals: () => api.get('/admin/all-rentals'),
  getUsers: () => api.get('/admin/users'),
  getCars: () => api.get('/cars'),
  
  // Car management
  createCar: (carData) => {
    if (carData instanceof FormData) {
      return api.post('/cars', carData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.post('/cars', carData);
    }
  },
  
  updateCar: (id, carData) => {
    if (carData instanceof FormData) {
      return api.put(`/cars/${id}`, carData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put(`/cars/${id}`, carData);
    }
  },
  
  deleteCar: (id) => api.delete(`/cars/${id}`),
  
  // Messages (admin)
  getMessages: () => adminMessagesAPI.getAll(),
  getMessage: (id) => adminMessagesAPI.getById(id),
  deleteMessage: (id) => adminMessagesAPI.delete(id),
  replyToMessage: (replyData) => adminMessagesAPI.reply(replyData),
  markMessageAsRead: (id) => adminMessagesAPI.markAsRead(id),
  getUnreadMessageCount: () => adminMessagesAPI.getUnreadCount(),
  
  // Locations (admin)
  getLocations: () => locationsAPI.getAll(),
  createLocation: (locationData) => locationsAPI.create(locationData),
  updateLocation: (id, locationData) => locationsAPI.update(id, locationData),
  toggleLocationActive: (id) => locationsAPI.toggleActive(id),
  deleteLocation: (id) => locationsAPI.delete(id),
  
  // Contact Info (admin)
  getContactInfo: () => contactAPI.getInfo(),
  updateContactInfo: (contactData) => contactAPI.updateInfo(contactData),
  
  // Analytics (admin)
  getAnalytics: (type, period = 'month') => {
    switch(type) {
      case 'revenue':
        return analyticsAPI.getRevenue(period);
      case 'bookings':
        return analyticsAPI.getBookings(period);
      case 'popular-cars':
        return analyticsAPI.getPopularCars();
      case 'popular-locations':
        return analyticsAPI.getPopularLocations();
      case 'user-growth':
        return analyticsAPI.getUserGrowth(period);
      case 'car-types':
        return analyticsAPI.getCarTypeDistribution();
      case 'dashboard':
      default:
        return analyticsAPI.getDashboardSummary();
    }
  },
};

export default api;
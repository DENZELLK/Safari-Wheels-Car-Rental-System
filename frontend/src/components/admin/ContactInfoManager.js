import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';

const ContactInfoManager = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Form state - matches API DTO structure
  const [formData, setFormData] = useState({
    address: {
      full: '',
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'South Africa'
    },
    phone: {
      main: '',
      support: ''
    },
    email: {
      info: '',
      support: ''
    },
    hours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: '10:00 AM - 2:00 PM'
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactAPI.getInfo();
      const data = response.data;
      
      console.log('📥 Contact info loaded:', data);
      
      // Transform API response to match form structure
      const transformedData = {
        address: {
          full: data.address?.full || '',
          street: data.address?.street || '',
          city: data.address?.city || '',
          province: data.address?.province || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || 'South Africa'
        },
        phone: {
          main: data.phone?.main || '',
          support: data.phone?.support || ''
        },
        email: {
          info: data.email?.info || '',
          support: data.email?.support || ''
        },
        hours: {
          monday: data.hours?.monday || '8:00 AM - 6:00 PM',
          tuesday: data.hours?.tuesday || '8:00 AM - 6:00 PM',
          wednesday: data.hours?.wednesday || '8:00 AM - 6:00 PM',
          thursday: data.hours?.thursday || '8:00 AM - 6:00 PM',
          friday: data.hours?.friday || '8:00 AM - 6:00 PM',
          saturday: data.hours?.saturday || '9:00 AM - 4:00 PM',
          sunday: data.hours?.sunday || '10:00 AM - 2:00 PM'
        },
        socialMedia: {
          facebook: data.socialMedia?.facebook || '',
          twitter: data.socialMedia?.twitter || '',
          instagram: data.socialMedia?.instagram || '',
          linkedin: data.socialMedia?.linkedin || ''
        }
      };
      
      setContactInfo(transformedData);
      setFormData(transformedData);
      
    } catch (error) {
      console.error('❌ Error fetching contact info:', error);
      setError(error.response?.data?.message || 'Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate phone numbers
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    
    if (formData.phone.main && !phoneRegex.test(formData.phone.main)) {
      errors.mainPhone = 'Please enter a valid phone number';
    }
    
    if (formData.phone.support && !phoneRegex.test(formData.phone.support)) {
      errors.supportPhone = 'Please enter a valid phone number';
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formData.email.info && !emailRegex.test(formData.email.info)) {
      errors.infoEmail = 'Please enter a valid email address';
    }
    
    if (formData.email.support && !emailRegex.test(formData.email.support)) {
      errors.supportEmail = 'Please enter a valid email address';
    }

    // Validate URLs
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (formData.socialMedia.facebook && !urlRegex.test(formData.socialMedia.facebook)) {
      errors.facebook = 'Please enter a valid URL';
    }
    
    if (formData.socialMedia.twitter && !urlRegex.test(formData.socialMedia.twitter)) {
      errors.twitter = 'Please enter a valid URL';
    }
    
    if (formData.socialMedia.instagram && !urlRegex.test(formData.socialMedia.instagram)) {
      errors.instagram = 'Please enter a valid URL';
    }
    
    if (formData.socialMedia.linkedin && !urlRegex.test(formData.socialMedia.linkedin)) {
      errors.linkedin = 'Please enter a valid URL';
    }

    // Validate hours format (basic check)
    const hoursRegex = /^([0-9]{1,2}(:[0-9]{2})?\s*(AM|PM)\s*-\s*[0-9]{1,2}(:[0-9]{2})?\s*(AM|PM))$/i;
    
    Object.entries(formData.hours).forEach(([day, hours]) => {
      if (hours && !hoursRegex.test(hours.trim())) {
        errors[`hours_${day}`] = 'Please use format: 9:00 AM - 5:00 PM';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear validation error for this field
    if (validationErrors[field] || validationErrors[`${section}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors[`${section}_${field}`];
        return newErrors;
      });
    }
  };

  const handleHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));

    // Clear validation error for this day
    if (validationErrors[`hours_${day}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`hours_${day}`];
        return newErrors;
      });
    }
  };

  // Transform form data to API format
  const transformToApiFormat = (data) => {
    // Construct full address from components
    const fullAddress = `${data.address.street}, ${data.address.city}, ${data.address.province} ${data.address.postalCode}, ${data.address.country}`;

    return {
      address: {
        full: fullAddress,
        street: data.address.street,
        city: data.address.city,
        province: data.address.province,
        postalCode: data.address.postalCode,
        country: data.address.country
      },
      phone: {
        main: data.phone.main,
        support: data.phone.support
      },
      email: {
        info: data.email.info,
        support: data.email.support
      },
      hours: {
        monday: data.hours.monday,
        tuesday: data.hours.tuesday,
        wednesday: data.hours.wednesday,
        thursday: data.hours.thursday,
        friday: data.hours.friday,
        saturday: data.hours.saturday,
        sunday: data.hours.sunday
      },
      socialMedia: {
        facebook: data.socialMedia.facebook,
        twitter: data.socialMedia.twitter,
        instagram: data.socialMedia.instagram,
        linkedin: data.socialMedia.linkedin
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      const apiData = transformToApiFormat(formData);
      console.log('📤 Saving contact info:', apiData);
      
      await contactAPI.updateInfo(apiData);
      
      setContactInfo(formData);
      setSuccessMessage('Contact information updated successfully!');
      
      // Refresh data to ensure sync
      await fetchContactInfo();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Error saving contact info:', error);
      setError(error.response?.data?.message || 'Failed to save contact information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (contactInfo) {
      setFormData(contactInfo);
      setValidationErrors({});
      setError(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Contact Information Management</h3>
        <button
          onClick={fetchContactInfo}
          className="text-amber-600 hover:text-amber-700 text-sm flex items-center"
          title="Refresh"
        >
          <i className="fas fa-sync-alt mr-1"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
          <i className="fas fa-exclamation-circle mr-3 mt-1"></i>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
          <i className="fas fa-check-circle mr-3 mt-1"></i>
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-map-marker-alt text-amber-500 mr-2"></i>
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address (Preview)
              </label>
              <input
                type="text"
                value={`${formData.address.street}, ${formData.address.city}, ${formData.address.province} ${formData.address.postalCode}, ${formData.address.country}`}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                readOnly
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">This is how your address will appear on the website</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Luxury Avenue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Sandton"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.province}
                onChange={(e) => handleInputChange('address', 'province', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.province ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Gauteng"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2196"
                required
              />
            </div>
          </div>
        </div>

        {/* Phone Numbers Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-phone text-amber-500 mr-2"></i>
            Phone Numbers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone.main}
                onChange={(e) => handleInputChange('phone', 'main', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.mainPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+27 65 599 5628"
                required
              />
              {validationErrors.mainPhone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.mainPhone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Phone
              </label>
              <input
                type="tel"
                value={formData.phone.support}
                onChange={(e) => handleInputChange('phone', 'support', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.supportPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+27 65 599 5628"
              />
              {validationErrors.supportPhone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.supportPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-envelope text-amber-500 mr-2"></i>
            Email Addresses
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Info Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email.info}
                onChange={(e) => handleInputChange('email', 'info', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.infoEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="info@safariwheels.co.za"
                required
              />
              {validationErrors.infoEmail && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.infoEmail}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={formData.email.support}
                onChange={(e) => handleInputChange('email', 'support', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.supportEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="support@safariwheels.co.za"
              />
              {validationErrors.supportEmail && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.supportEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Operating Hours Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-clock text-amber-500 mr-2"></i>
            Operating Hours
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.hours).map(([day, hours]) => (
              <div key={day}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {day} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    validationErrors[`hours_${day}`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="9:00 AM - 5:00 PM"
                  required
                />
                {validationErrors[`hours_${day}`] && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors[`hours_${day}`]}</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: 9:00 AM - 5:00 PM (use AM/PM format)
          </p>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-share-alt text-amber-500 mr-2"></i>
            Social Media Links
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.facebook ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://facebook.com/safariwheels"
              />
              {validationErrors.facebook && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.facebook}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              <input
                type="url"
                value={formData.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.twitter ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://twitter.com/safariwheels"
              />
              {validationErrors.twitter && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.twitter}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.instagram ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://instagram.com/safariwheels"
              />
              {validationErrors.instagram && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.instagram}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={formData.socialMedia.linkedin}
                onChange={(e) => handleInputChange('socialMedia', 'linkedin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.linkedin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://linkedin.com/company/safariwheels"
              />
              {validationErrors.linkedin && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.linkedin}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Leave blank to hide social media icons
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoManager;
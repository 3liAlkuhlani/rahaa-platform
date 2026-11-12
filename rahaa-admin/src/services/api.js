/**
 * Central API Service Layer for Rahaa Platform
 * Handles communication with the Laravel REST API
 */
import { normalizePayloadDigits, toWesternDigits } from '../utils/arabicLocalization';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rahaa-platform-production.up.railway.app/api';

/**
 * Helper to get active auth token from localStorage
 */
export const getToken = () => localStorage.getItem('rahaa_token');
export const setToken = (token) => localStorage.setItem('rahaa_token', token);
export const removeToken = () => localStorage.removeItem('rahaa_token');

export const getCurrentUser = () => {
  const user = localStorage.getItem('rahaa_user');
  return user ? JSON.parse(user) : null;
};
export const setCurrentUser = (user) => localStorage.setItem('rahaa_user', JSON.stringify(user));
export const removeCurrentUser = () => localStorage.removeItem('rahaa_user');

/**
 * Determine the specific transport service owned by the driver ('taxi' | 'rental' | 'truck' | 'motorcycle')
 */
export const getDriverPrimaryService = (user = getCurrentUser()) => {
  if (!user || user.role !== 'driver') return 'taxi';
  if (user.primary_service && ['taxi', 'rental', 'truck', 'motorcycle'].includes(user.primary_service)) {
    return user.primary_service;
  }
  if (Array.isArray(user.driver_services) && user.driver_services.length > 0) {
    const firstSrv = user.driver_services[0]?.service_type;
    if (['taxi', 'rental', 'truck', 'motorcycle'].includes(firstSrv)) return firstSrv;
  }
  if (Array.isArray(user.vehicles) && user.vehicles.length > 0) {
    const firstVeh = user.vehicles[0]?.service_type;
    if (['taxi', 'rental', 'truck', 'motorcycle'].includes(firstVeh)) return firstVeh;
  }
  const phone = toWesternDigits(String(user.phone || ''));
  if (phone === '774445566') return 'rental';
  if (phone === '775556677') return 'truck';
  if (phone === '776667788') return 'motorcycle';
  return 'taxi';
};

/**
 * Get the dedicated portal route for the driver's specific transport mode
 */
export const getDriverPortalRoute = (user = getCurrentUser()) => {
  const srv = getDriverPrimaryService(user);
  return `/driver/${srv}`;
};

/**
 * Central request wrapper
 */
async function request(endpoint, options = {}) {
  const normalizedEndpoint = toWesternDigits(endpoint);
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = getToken();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  let body = options.body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      body = JSON.stringify(normalizePayloadDigits(parsed));
    } catch {
      body = toWesternDigits(body);
    }
  } else if (body instanceof FormData) {
    for (const [key, val] of Array.from(body.entries())) {
      if (typeof val === 'string') {
        body.set(key, toWesternDigits(val));
      }
    }
  }

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    body,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `خطأ في الخادم (${response.status})`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    throw new Error('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم Laravel');
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  registerPassenger: (data) => request('/auth/register/passenger', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  registerDriver: (formData) => request('/auth/register/driver', {
    method: 'POST',
    body: formData,
  }),

  me: () => request('/auth/me', { method: 'GET' }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  // Password Reset via SMS (Passenger & Driver ONLY)
  requestSmsReset: (phone) => request('/auth/password-reset/sms/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  }),

  verifySmsCode: (phone, code) => request('/auth/password-reset/sms/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  }),

  resetPasswordWithSms: (data) => request('/auth/password-reset/sms/reset', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin: Change Password strictly inside Admin Dashboard
  adminChangePassword: (data) => request('/admin/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin Dashboard & Management
  getAdminStats: () => request('/admin/stats', { method: 'GET' }),
  getDrivers: (status = 'all') => request(`/admin/drivers?status=${status}`, { method: 'GET' }),
  approveDriver: (id) => request(`/admin/drivers/${id}/approve`, { method: 'POST' }),
  rejectDriver: (id, reason) => request(`/admin/drivers/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  getPassengers: () => request('/admin/passengers', { method: 'GET' }),
  getAdminTrips: (status = 'all') => request(`/admin/trips?status=${status}`, { method: 'GET' }),
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle-status`, { method: 'POST' }),

  // Trips
  getMyTrips: () => request('/trips/my-trips', { method: 'GET' }),
  getTrip: (id) => request(`/trips/${id}`, { method: 'GET' }),
  requestTrip: (tripData) => request('/trips/request', {
    method: 'POST',
    body: JSON.stringify(tripData),
  }),
  getAvailableTrips: () => request('/trips/available', { method: 'GET' }),
  acceptTrip: (id) => request(`/trips/${id}/accept`, { method: 'POST' }),
  updateTripStatus: (id, status, reason = null) => request(`/trips/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, cancellation_reason: reason }),
  }),
  rateTrip: (id, rating, review = '') => request(`/trips/${id}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, review }),
  }),

  // Multi-Transport System Endpoints
  getTransportServices: () => request('/transport/services', { method: 'GET' }),
  getRentals: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.make && filters.make !== 'all') params.append('make', filters.make);
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.max_daily_rate) params.append('max_daily_rate', filters.max_daily_rate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/transport/rentals${query}`, { method: 'GET' });
  },
  getRentalDetails: (id) => request(`/transport/rentals/${id}`, { method: 'GET' }),
  bookRental: (bookingData) => request('/transport/rentals/book', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  getMyRentalBookings: () => request('/transport/rentals/my-bookings', { method: 'GET' }),
  updateRentalBookingStatus: (id, status, cancellation_reason = null) => request(`/transport/rentals/bookings/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, cancellation_reason }),
  }),

  // Cargo & Motorcycles
  requestCargo: (cargoData) => request('/transport/cargo/request', {
    method: 'POST',
    body: JSON.stringify(cargoData),
  }),
  getAvailableCargoOrders: () => request('/transport/cargo/available', { method: 'GET' }),
  acceptCargoOrder: (id) => request(`/transport/cargo/${id}/accept`, { method: 'POST' }),
  updateCargoStatus: (id, status, cancellation_reason = null) => request(`/transport/cargo/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, cancellation_reason }),
  }),

  // Vehicle & Verification
  addVehicle: (vehicleData) => request('/transport/vehicles/add', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  }),
  uploadVerificationDocument: (formData) => request('/transport/documents/upload', {
    method: 'POST',
    body: formData,
  }),
  getMyTransportServices: () => request('/transport/my-services', { method: 'GET' }),

  // Renter Verification, Guarantees & Handover
  getActiveOrder: () => request('/transport/active-order', { method: 'GET' }),
  getRenterVerification: () => request('/transport/rentals/verification', { method: 'GET' }),
  submitRenterVerification: (formData) => request('/transport/rentals/verification', {
    method: 'POST',
    body: formData,
  }),
  updateRentalGuaranteeStatus: (bookingId, data) => request(`/transport/rentals/bookings/${bookingId}/guarantee`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  recordVehicleHandover: (bookingId, data) => request(`/transport/rentals/bookings/${bookingId}/handover`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  rateRentalBooking: (bookingId, rating, review = '') => request(`/transport/rentals/bookings/${bookingId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, review }),
  }),
  rateCargoRequest: (cargoId, rating, review = '') => request(`/transport/cargo/${cargoId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, review }),
  }),

  // Admin Transport Management
  getAdminVehicles: (serviceType = 'all', status = 'all') =>
    request(`/admin/transport/vehicles?service_type=${serviceType}&status=${status}`, { method: 'GET' }),
  approveAdminVehicle: (id) => request(`/admin/transport/vehicles/${id}/approve`, { method: 'POST' }),
  rejectAdminVehicle: (id, reason) => request(`/admin/transport/vehicles/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  getAdminDocuments: (status = 'all') => request(`/admin/transport/documents?status=${status}`, { method: 'GET' }),
  verifyAdminDocument: (id, status, notes = null) => request(`/admin/transport/documents/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify({ status, notes }),
  }),
  getAdminRentalBookings: () => request('/admin/transport/rentals/bookings', { method: 'GET' }),
  getAdminCargoRequests: () => request('/admin/transport/cargo/requests', { method: 'GET' }),
  updateAdminServiceType: (slug, data) => request(`/admin/transport/services/${slug}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export default api;

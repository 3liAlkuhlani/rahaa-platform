import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  getToken,
  getCurrentUser,
  getDriverPrimaryService,
  getDriverPortalRoute,
  isAdminOrSupervisor,
  hasAdminPermission,
  getAdminDefaultRoute,
} from '../services/api';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout';
import { PassengerLayout } from '../components/layout/PassengerLayout';
import { DriverLayout } from '../components/layout/DriverLayout';

// Splash & Auth Pages
import { SplashScreen } from '../pages/SplashScreen';
import { Login } from '../pages/Login';
import { PassengerRegister } from '../pages/PassengerRegister';
import { DriverRegister } from '../pages/DriverRegister';

// Passenger Pages
import { PassengerHome } from '../pages/PassengerHome';
import { PassengerTaxiBooking } from '../pages/PassengerTaxiBooking';
import { PassengerTripMap } from '../pages/PassengerTripMap';
import { PassengerTrips } from '../pages/PassengerTrips';
import { PassengerProfile } from '../pages/PassengerProfile';
import { PassengerRentals } from '../pages/PassengerRentals';
import { PassengerTrucks } from '../pages/PassengerTrucks';
import { PassengerMotorcycles } from '../pages/PassengerMotorcycles';
import { LocationSelectionScreen } from '../pages/LocationSelectionScreen';

// Driver Dedicated Pages per Transport Mode
import { DriverHome } from '../pages/DriverHome';
import { DriverTaxiDashboard } from '../pages/DriverTaxiDashboard';
import { DriverRentalDashboard } from '../pages/DriverRentalDashboard';
import { DriverTruckDashboard } from '../pages/DriverTruckDashboard';
import { DriverMotorcycleDashboard } from '../pages/DriverMotorcycleDashboard';
import { ActiveTripTracking } from '../pages/ActiveTripTracking';
import { DriverEarnings } from '../pages/DriverEarnings';
import { DriverProfile } from '../pages/DriverProfile';
import { DriverRequests } from '../pages/DriverRequests';
import { DriverRequestDetails } from '../pages/DriverRequestDetails';

// Admin Pages
import { Dashboard } from '../pages/Dashboard';
import { Trips } from '../pages/Trips';
import { Drivers } from '../pages/Drivers';
import { Users } from '../pages/Users';
import { Analytics } from '../pages/Analytics';
import { Settings } from '../pages/Settings';
import { Help } from '../pages/Help';
import { Security } from '../pages/Security';
import { AdminTransportManagement } from '../pages/AdminTransportManagement';
import { Complaints } from '../pages/Complaints';
import { Supervisors } from '../pages/Supervisors';
import { AdminLogin } from '../pages/AdminLogin';

/**
 * Guard for Admin & Supervisor Portal:
 * Strictly blocks Passengers and Drivers from entering the Admin Dashboard,
 * and enforces per-route RBAC permissions for Supervisors.
 */
const AdminProtectedRoute = ({ children, requiredPermission = null, adminOnly = false }) => {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role === 'passenger') {
    return <Navigate to="/passenger" replace />;
  }

  if (user.role === 'driver') {
    return <Navigate to={getDriverPortalRoute(user)} replace />;
  }

  if (!isAdminOrSupervisor(user)) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to={getAdminDefaultRoute(user)} replace />;
  }

  if (requiredPermission && !hasAdminPermission(requiredPermission, user)) {
    return <Navigate to={getAdminDefaultRoute(user)} replace />;
  }

  return children;
};

/**
 * Guard for Passenger Portal
 */
const PassengerProtectedRoute = ({ children }) => {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminOrSupervisor(user)) {
    return <Navigate to={getAdminDefaultRoute(user)} replace />;
  }

  if (user.role === 'driver') {
    return <Navigate to={getDriverPortalRoute(user)} replace />;
  }

  return children;
};

/**
 * Guard for Driver Portal
 */
const DriverProtectedRoute = ({ children }) => {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminOrSupervisor(user)) {
    return <Navigate to={getAdminDefaultRoute(user)} replace />;
  }

  if (user.role === 'passenger') {
    return <Navigate to="/passenger" replace />;
  }

  return children;
};

/**
 * Guard ensuring each driver only accesses the dedicated page for the vehicle they own
 */
const DriverServiceGuard = ({ allowedService, children }) => {
  const user = getCurrentUser();
  const primaryService = getDriverPrimaryService(user);
  const ownedServices = Array.isArray(user?.driver_services)
    ? user.driver_services.map((s) => s.service_type)
    : [];

  if (primaryService !== allowedService && !ownedServices.includes(allowedService)) {
    return <Navigate to={getDriverPortalRoute(user)} replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= Splash Screen (Root Entry) ================= */}
        <Route path="/" element={<SplashScreen />} />

        {/* ================= Authentication Routes ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/supervisor/login" element={<AdminLogin />} />
        <Route path="/register" element={<PassengerRegister />} />
        <Route path="/register/passenger" element={<PassengerRegister />} />
        <Route path="/register/driver" element={<DriverRegister />} />

        {/* ================= Passenger Portal Routes ================= */}
        <Route
          path="/passenger"
          element={
            <PassengerProtectedRoute>
              <PassengerLayout />
            </PassengerProtectedRoute>
          }
        >
          <Route index element={<PassengerHome />} />
          <Route path="taxi" element={<PassengerTaxiBooking />} />
          <Route path="location" element={<LocationSelectionScreen />} />
          <Route path="rentals" element={<PassengerRentals />} />
          <Route path="trucks" element={<PassengerTrucks />} />
          <Route path="motorcycles" element={<PassengerMotorcycles />} />
          <Route path="map" element={<PassengerTripMap />} />
          <Route path="map/:tripId" element={<PassengerTripMap />} />
          <Route path="trips" element={<PassengerTrips />} />
          <Route path="profile" element={<PassengerProfile />} />
        </Route>

        {/* ================= Driver Portal Routes (Separated by Vehicle Type) ================= */}
        <Route
          path="/driver"
          element={
            <DriverProtectedRoute>
              <DriverLayout />
            </DriverProtectedRoute>
          }
        >
          {/* Auto-redirect /driver to the driver's specific vehicle portal */}
          <Route index element={<DriverHome />} />

          {/* 1. Taxi Driver Dedicated Page */}
          <Route
            path="taxi"
            element={
              <DriverServiceGuard allowedService="taxi">
                <DriverTaxiDashboard />
              </DriverServiceGuard>
            }
          />

          {/* 2. Car Rental Owner/Driver Dedicated Page */}
          <Route
            path="rental"
            element={
              <DriverServiceGuard allowedService="rental">
                <DriverRentalDashboard />
              </DriverServiceGuard>
            }
          />

          {/* 3. Cargo Truck Driver Dedicated Page */}
          <Route
            path="truck"
            element={
              <DriverServiceGuard allowedService="truck">
                <DriverTruckDashboard />
              </DriverServiceGuard>
            }
          />

          {/* 4. Motorcycle Captain Dedicated Page */}
          <Route
            path="motorcycle"
            element={
              <DriverServiceGuard allowedService="motorcycle">
                <DriverMotorcycleDashboard />
              </DriverServiceGuard>
            }
          />

          <Route path="requests" element={<DriverRequests />} />
          <Route path="requests/:type/:id" element={<DriverRequestDetails />} />
          <Route path="active-trip" element={<ActiveTripTracking />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route path="profile" element={<DriverProfile />} />
        </Route>

        {/* ================= Independent Admin & Supervisor Portal (/admin) ================= */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route
            index
            element={
              <AdminProtectedRoute requiredPermission="overview">
                <Dashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="transport"
            element={
              <AdminProtectedRoute requiredPermission="vehicles">
                <AdminTransportManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="trips"
            element={
              <AdminProtectedRoute requiredPermission="trips">
                <Trips />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="drivers"
            element={
              <AdminProtectedRoute requiredPermission="drivers">
                <Drivers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <AdminProtectedRoute requiredPermission="users">
                <Users />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="complaints"
            element={
              <AdminProtectedRoute requiredPermission="complaints">
                <Complaints />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <AdminProtectedRoute requiredPermission="analytics">
                <Analytics />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="supervisors"
            element={
              <AdminProtectedRoute adminOnly>
                <Supervisors />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <AdminProtectedRoute requiredPermission="settings">
                <Settings />
              </AdminProtectedRoute>
            }
          />
          <Route path="help" element={<Help />} />
          <Route path="security" element={<Security />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

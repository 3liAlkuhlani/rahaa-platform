import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, getDriverPortalRoute } from '../services/api';

/**
 * Smart Dispatcher for Driver Portal:
 * Redirects each authenticated driver directly to the dedicated dashboard
 * corresponding to the transport vehicle/service they own:
 * - /driver/taxi
 * - /driver/rental
 * - /driver/truck
 * - /driver/motorcycle
 */
export const DriverHome = () => {
  const user = getCurrentUser();
  const targetRoute = getDriverPortalRoute(user);
  return <Navigate to={targetRoute} replace />;
};

export default DriverHome;

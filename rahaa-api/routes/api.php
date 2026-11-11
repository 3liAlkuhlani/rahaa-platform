<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\AdminPasswordController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MultiTransportController;
use App\Http\Controllers\Api\AdminTransportController;

/*
|--------------------------------------------------------------------------
| Rahaa Smart Mobility Platform - API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication & Transport Catalog
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register/passenger', [AuthController::class, 'registerPassenger']);
    Route::post('/register/driver', [AuthController::class, 'registerDriver']);

    // SMS Password Recovery (Passenger & Driver ONLY)
    Route::prefix('password-reset/sms')->group(function () {
        Route::post('/request', [PasswordResetController::class, 'requestReset']);
        Route::post('/verify', [PasswordResetController::class, 'verifyCode']);
        Route::post('/reset', [PasswordResetController::class, 'resetPassword']);
    });
});

// Public Transport Services & Rental Catalog
Route::get('/transport/services', [MultiTransportController::class, 'getServices']);
Route::get('/transport/rentals', [MultiTransportController::class, 'listRentals']);
Route::get('/transport/rentals/{id}', [MultiTransportController::class, 'showRental'])->whereNumber('id');

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Current User Profile & Logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Multi-Transport Endpoints (Taxi, Rentals, Cargo Trucks, Motorcycles)
    Route::prefix('transport')->group(function () {
        Route::get('/active-order', [MultiTransportController::class, 'getActiveOrder']);
        Route::post('/rentals/book', [MultiTransportController::class, 'bookRental']);
        Route::get('/rentals/my-bookings', [MultiTransportController::class, 'myRentalBookings']);
        Route::post('/rentals/bookings/{id}/status', [MultiTransportController::class, 'updateBookingStatus']);
        Route::get('/rentals/verification', [MultiTransportController::class, 'getRenterVerification']);
        Route::post('/rentals/verification', [MultiTransportController::class, 'submitRenterVerification']);
        Route::post('/rentals/bookings/{id}/guarantee', [MultiTransportController::class, 'updateGuaranteeStatus']);
        Route::post('/rentals/bookings/{id}/handover', [MultiTransportController::class, 'recordVehicleHandover']);
        Route::post('/rentals/bookings/{id}/rate', [MultiTransportController::class, 'rateRentalBooking']);

        Route::post('/cargo/request', [MultiTransportController::class, 'requestCargo']);
        Route::get('/cargo/available', [MultiTransportController::class, 'availableCargoOrders']);
        Route::post('/cargo/{id}/accept', [MultiTransportController::class, 'acceptCargoOrder']);
        Route::post('/cargo/{id}/status', [MultiTransportController::class, 'updateCargoStatus']);
        Route::post('/cargo/{id}/rate', [MultiTransportController::class, 'rateCargoRequest']);

        Route::post('/vehicles/add', [MultiTransportController::class, 'addVehicle']);
        Route::post('/documents/upload', [MultiTransportController::class, 'uploadDocument']);
        Route::get('/my-services', [MultiTransportController::class, 'myServices']);
    });

    // Trips (Taxi & On-Demand)
    Route::prefix('trips')->group(function () {
        Route::get('/my-trips', [TripController::class, 'userTrips']);
        Route::post('/request', [TripController::class, 'requestTrip']);
        Route::get('/available', [TripController::class, 'availableTrips']);
        Route::get('/{id}', [TripController::class, 'showTrip']);
        Route::post('/{id}/accept', [TripController::class, 'acceptTrip']);
        Route::post('/{id}/status', [TripController::class, 'updateStatus']);
        Route::post('/{id}/rate', [TripController::class, 'rateTrip']);
    });

    // Admin-Only Routes (Strictly protected by EnsureAdminRole middleware)
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Change Admin Password strictly from inside Admin Dashboard
        Route::post('/change-password', [AdminPasswordController::class, 'changePassword']);

        // Dashboard Stats
        Route::get('/stats', [AdminController::class, 'dashboardStats']);

        // Drivers Management
        Route::get('/drivers', [AdminController::class, 'listDrivers']);
        Route::post('/drivers/{id}/approve', [AdminController::class, 'approveDriver']);
        Route::post('/drivers/{id}/reject', [AdminController::class, 'rejectDriver']);

        // Passengers Management
        Route::get('/passengers', [AdminController::class, 'listPassengers']);

        // Trips Management
        Route::get('/trips', [AdminController::class, 'listTrips']);

        // Multi-Transport Management
        Route::get('/transport/vehicles', [AdminTransportController::class, 'listVehicles']);
        Route::post('/transport/vehicles/{id}/approve', [AdminTransportController::class, 'approveVehicle']);
        Route::post('/transport/vehicles/{id}/reject', [AdminTransportController::class, 'rejectVehicle']);
        Route::get('/transport/documents', [AdminTransportController::class, 'listDocuments']);
        Route::post('/transport/documents/{id}/verify', [AdminTransportController::class, 'verifyDocument']);
        Route::get('/transport/rentals/bookings', [AdminTransportController::class, 'listRentalBookings']);
        Route::get('/transport/cargo/requests', [AdminTransportController::class, 'listCargoRequests']);
        Route::post('/transport/services/{slug}', [AdminTransportController::class, 'updateServiceType']);

        // Ban / Unban
        Route::post('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
    });
});

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\AdminPasswordController;
use App\Http\Controllers\Api\AdminComplaintController;
use App\Http\Controllers\Api\AdminSupervisorController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MultiTransportController;
use App\Http\Controllers\Api\AdminTransportController;
use App\Http\Controllers\Api\DriverRequestController;

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

    // Complaints & Reports submission (Passenger & Driver)
    Route::post('/complaints', [AdminComplaintController::class, 'submitComplaint']);
    Route::get('/complaints/my', [AdminComplaintController::class, 'myComplaints']);

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

    // Driver Unified My Requests Portal (Taxi, Motorcycle, Truck, Rental)
    Route::prefix('driver/requests')->group(function () {
        Route::get('/', [DriverRequestController::class, 'index']);
        Route::get('/{type}/{id}', [DriverRequestController::class, 'show'])->whereIn('type', ['trip', 'cargo', 'rental'])->whereNumber('id');
        Route::post('/{type}/{id}/accept', [DriverRequestController::class, 'accept'])->whereIn('type', ['trip', 'cargo', 'rental'])->whereNumber('id');
        Route::post('/{type}/{id}/reject', [DriverRequestController::class, 'reject'])->whereIn('type', ['trip', 'cargo', 'rental'])->whereNumber('id');
    });

    // Admin & Supervisor Portal Routes (Protected by EnsureAdminRole + Granular Permission RBAC)
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Dashboard Overview & Real-Time Charts
        Route::get('/stats', [AdminController::class, 'dashboardStats'])->middleware('permission:overview');

        // Drivers Management
        Route::middleware('permission:drivers')->group(function () {
            Route::get('/drivers', [AdminController::class, 'listDrivers']);
            Route::get('/drivers/{id}', [AdminController::class, 'showDriver'])->whereNumber('id');
            Route::post('/drivers/{id}/approve', [AdminController::class, 'approveDriver']);
            Route::post('/drivers/{id}/reject', [AdminController::class, 'rejectDriver']);
        });

        // Users & Passengers Management
        Route::middleware('permission:users')->group(function () {
            Route::get('/users', [AdminController::class, 'listUsers']);
            Route::get('/users/{id}', [AdminController::class, 'showUser'])->whereNumber('id');
            Route::put('/users/{id}', [AdminController::class, 'updateUser'])->whereNumber('id');
            Route::get('/passengers', [AdminController::class, 'listPassengers']);
            Route::post('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        });

        // Trips Management
        Route::middleware('permission:trips')->group(function () {
            Route::get('/trips', [AdminController::class, 'listTrips']);
            Route::get('/trips/{id}', [AdminController::class, 'showTrip'])->whereNumber('id');
        });

        // Vehicles & Multi-Transport Management
        Route::middleware('permission:vehicles')->group(function () {
            Route::get('/transport/vehicles', [AdminTransportController::class, 'listVehicles']);
            Route::put('/transport/vehicles/{id}', [AdminTransportController::class, 'updateVehicle'])->whereNumber('id');
            Route::post('/transport/vehicles/{id}/approve', [AdminTransportController::class, 'approveVehicle']);
            Route::post('/transport/vehicles/{id}/reject', [AdminTransportController::class, 'rejectVehicle']);
            Route::get('/transport/documents', [AdminTransportController::class, 'listDocuments']);
            Route::post('/transport/documents/{id}/verify', [AdminTransportController::class, 'verifyDocument']);
            Route::get('/transport/rentals/bookings', [AdminTransportController::class, 'listRentalBookings']);
            Route::get('/transport/cargo/requests', [AdminTransportController::class, 'listCargoRequests']);
            Route::post('/transport/services/{slug}', [AdminTransportController::class, 'updateServiceType']);
        });

        // Complaints & Reports Management
        Route::middleware('permission:complaints')->group(function () {
            Route::get('/complaints', [AdminComplaintController::class, 'listComplaints']);
            Route::get('/complaints/{id}', [AdminComplaintController::class, 'showComplaint'])->whereNumber('id');
            Route::put('/complaints/{id}', [AdminComplaintController::class, 'updateComplaint'])->whereNumber('id');
        });

        // Reports & Analytics + CSV/Excel Export
        Route::middleware('permission:analytics')->group(function () {
            Route::get('/reports', [AdminController::class, 'reports']);
            Route::get('/reports/export', [AdminController::class, 'exportReport']);
        });

        // Strictly Admin-Only Routes (Supervisors CANNOT access these)
        Route::middleware('admin.only')->group(function () {
            Route::post('/change-password', [AdminPasswordController::class, 'changePassword']);
            Route::get('/supervisors', [AdminSupervisorController::class, 'listSupervisors']);
            Route::post('/supervisors', [AdminSupervisorController::class, 'createSupervisor']);
            Route::put('/supervisors/{id}', [AdminSupervisorController::class, 'updateSupervisor'])->whereNumber('id');
            Route::post('/supervisors/{id}/toggle-status', [AdminSupervisorController::class, 'toggleSupervisorStatus'])->whereNumber('id');
            Route::get('/audit-logs', [AdminSupervisorController::class, 'auditLogs']);
        });
    });
});

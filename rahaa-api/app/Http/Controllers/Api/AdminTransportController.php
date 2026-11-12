<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\ServiceType;
use App\Models\Vehicle;
use App\Models\RentalBooking;
use App\Models\CargoRequest;
use App\Models\VerificationDocument;
use App\Models\DriverService;
use App\Models\User;
use Illuminate\Http\Request;

class AdminTransportController extends Controller
{
    /**
     * Admin: List all registered vehicles across all 4 services
     */
    public function listVehicles(Request $request)
    {
        $query = Vehicle::with(['owner:id,name,phone', 'verificationDocuments']);

        if ($request->filled('service_type') && $request->service_type !== 'all') {
            $query->where('service_type', $request->service_type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $vehicles = $query->latest()->get();

        return response()->json([
            'success' => true,
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Admin: Approve a vehicle
     */
    public function approveVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->status = 'approved';
        $vehicle->rejection_reason = null;
        $vehicle->save();

        // Also approve driver service for this service_type
        DriverService::where('user_id', $vehicle->owner_id)
            ->where('service_type', $vehicle->service_type)
            ->update([
                'status' => 'approved',
                'approved_at' => now(),
            ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'vehicle_approved',
            'target_type' => 'Vehicle',
            'target_id' => $vehicle->id,
            'details' => "تم اعتماد المركبة {$vehicle->make} {$vehicle->model} ({$vehicle->plate_number})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم اعتماد المركبة ({$vehicle->make} {$vehicle->model}) وتفعيل الخدمة للمالك بنجاح",
            'vehicle' => $vehicle,
        ]);
    }

    /**
     * Admin: Reject a vehicle
     */
    public function rejectVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->status = 'rejected';
        $vehicle->rejection_reason = $request->input('reason', 'الوثائق أو صور المركبة غير مطابقة للشروط والمعايير');
        $vehicle->save();

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'vehicle_rejected',
            'target_type' => 'Vehicle',
            'target_id' => $vehicle->id,
            'details' => "تم رفض المركبة {$vehicle->make} {$vehicle->model}. السبب: {$vehicle->rejection_reason}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض اعتماد المركبة وتدوين السبب بنجاح',
            'vehicle' => $vehicle,
        ]);
    }

    /**
     * Admin: Update Vehicle details
     */
    public function updateVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'make' => 'sometimes|string|max:80',
            'model' => 'sometimes|string|max:80',
            'year' => 'sometimes|integer|min:1980|max:2030',
            'plate_number' => 'sometimes|string|max:40',
            'color' => 'nullable|string|max:40',
            'daily_rate' => 'nullable|numeric|min:0',
            'max_payload_kg' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,rejected,suspended',
        ]);

        $vehicle->update($validated);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'vehicle_updated',
            'target_type' => 'Vehicle',
            'target_id' => $vehicle->id,
            'details' => "تم تعديل بيانات المركبة {$vehicle->make} {$vehicle->model} ({$vehicle->plate_number})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المركبة بنجاح',
            'vehicle' => $vehicle->fresh(['owner:id,name,phone']),
        ]);
    }

    /**
     * Admin: List pending verification documents
     */
    public function listDocuments(Request $request)
    {
        $query = VerificationDocument::with(['user:id,name,phone', 'vehicle']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $documents = $query->latest()->get();

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }

    /**
     * Admin: Update verification document status
     */
    public function verifyDocument(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $doc = VerificationDocument::findOrFail($id);
        $doc->status = $request->status;
        $doc->notes = $request->notes;
        $doc->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الوثيقة بنجاح',
            'document' => $doc,
        ]);
    }

    /**
     * Admin: List all rental bookings
     */
    public function listRentalBookings(Request $request)
    {
        $bookings = RentalBooking::with(['vehicle', 'renter:id,name,phone', 'owner:id,name,phone'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Admin: List all cargo/truck/motorcycle requests
     */
    public function listCargoRequests(Request $request)
    {
        $requests = CargoRequest::with(['sender:id,name,phone', 'driver:id,name,phone'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }

    /**
     * Admin: Toggle Service Type Active Status or Pricing
     */
    public function updateServiceType(Request $request, $slug)
    {
        $service = ServiceType::where('slug', $slug)->firstOrFail();

        if ($request->has('is_active')) {
            $service->is_active = $request->boolean('is_active');
        }
        if ($request->filled('base_fare')) {
            $service->base_fare = $request->base_fare;
        }
        if ($request->filled('per_km_rate')) {
            $service->per_km_rate = $request->per_km_rate;
        }
        $service->save();

        return response()->json([
            'success' => true,
            'message' => "تم تحديث إعدادات خدمة ({$service->name_ar}) بنجاح",
            'service' => $service,
        ]);
    }
}

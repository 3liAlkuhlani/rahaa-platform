<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminComplaintController extends Controller
{
    /**
     * Passenger/Driver: Submit a new complaint or report
     */
    public function submitComplaint(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:180',
            'description' => 'required|string|max:2000',
            'category' => 'nullable|in:trip,driver,passenger,payment,vehicle,app,other',
            'trip_id' => 'nullable|exists:trips,id',
        ], [
            'subject.required' => 'عنوان الشكوى مطلوب',
            'description.required' => 'تفاصيل الشكوى مطلوبة',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $complaint = Complaint::create([
            'user_id' => $user->id,
            'trip_id' => $request->trip_id,
            'subject' => trim($request->subject),
            'description' => trim($request->description),
            'category' => $request->input('category', 'other'),
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال الشكوى بنجاح، وسيتم مراجعتها من قبل فريق الدعم والإشراف',
            'complaint' => $complaint->load(['trip:id,pickup_address,dropoff_address,status']),
        ], 201);
    }

    /**
     * Passenger/Driver: List my own complaints
     */
    public function myComplaints(Request $request)
    {
        $complaints = Complaint::where('user_id', $request->user()->id)
            ->with(['trip:id,pickup_address,dropoff_address,status', 'handler:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'complaints' => $complaints,
        ]);
    }

    /**
     * Admin/Supervisor: List all complaints with Search, Filter & Pagination
     */
    public function listComplaints(Request $request)
    {
        $status = $request->query('status', 'all');
        $category = $request->query('category', 'all');
        $search = trim((string) $request->query('search', ''));
        $perPage = min(max((int) $request->query('per_page', 20), 5), 100);

        $query = Complaint::with([
            'user:id,name,phone,role',
            'trip:id,pickup_address,dropoff_address,fare,status',
            'handler:id,name,role',
        ]);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $complaints = $query->latest()->paginate($perPage);

        $counts = [
            'all' => Complaint::count(),
            'open' => Complaint::where('status', 'open')->count(),
            'in_review' => Complaint::where('status', 'in_review')->count(),
            'resolved' => Complaint::where('status', 'resolved')->count(),
            'dismissed' => Complaint::where('status', 'dismissed')->count(),
        ];

        return response()->json([
            'success' => true,
            'complaints' => $complaints,
            'counts' => $counts,
        ]);
    }

    /**
     * Admin/Supervisor: Show single complaint details
     */
    public function showComplaint($id)
    {
        $complaint = Complaint::with([
            'user:id,name,phone,email,role',
            'trip.passenger:id,name,phone',
            'trip.driver:id,name,phone',
            'handler:id,name,role',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'complaint' => $complaint,
        ]);
    }

    /**
     * Admin/Supervisor: Update complaint status, supervisor notes & action taken
     */
    public function updateComplaint(Request $request, $id)
    {
        $actor = $request->user();
        $complaint = Complaint::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:open,in_review,resolved,dismissed',
            'supervisor_notes' => 'nullable|string|max:2000',
            'action_taken' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $complaint->status = $request->status;
        $complaint->supervisor_notes = $request->input('supervisor_notes', $complaint->supervisor_notes);
        $complaint->action_taken = $request->input('action_taken', $complaint->action_taken);
        $complaint->handled_by = $actor->id;
        if (in_array($request->status, ['resolved', 'dismissed'], true) && !$complaint->resolved_at) {
            $complaint->resolved_at = now();
        }
        $complaint->save();

        AdminLog::create([
            'admin_id' => $actor->id,
            'action' => 'complaint_updated',
            'target_type' => 'Complaint',
            'target_id' => $complaint->id,
            'details' => "تم تحديث الشكوى #{$complaint->id} إلى حالة ({$complaint->status})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الشكوى وتسجيل الإجراء بنجاح',
            'complaint' => $complaint->fresh(['user:id,name,phone,role', 'trip:id,pickup_address,dropoff_address,status', 'handler:id,name,role']),
        ]);
    }
}

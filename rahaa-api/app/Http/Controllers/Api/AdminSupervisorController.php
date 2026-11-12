<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminSupervisorController extends Controller
{
    /**
     * List all Admin and Supervisor accounts
     */
    public function listSupervisors(Request $request)
    {
        $staff = User::whereIn('role', ['admin', 'supervisor'])
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->latest()
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'username' => $u->username,
                    'phone' => $u->phone,
                    'email' => $u->email,
                    'role' => $u->role,
                    'status' => $u->status,
                    'permissions' => $u->isAdmin() ? User::SUPERVISOR_PERMISSIONS : ($u->permissions ?? []),
                    'created_at' => $u->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'supervisors' => $staff,
            'available_permissions' => User::SUPERVISOR_PERMISSIONS,
        ]);
    }

    /**
     * Create a new Supervisor account (Admin-only)
     */
    public function createSupervisor(Request $request)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:60|unique:users,username',
            'phone' => 'required|string|min:7|max:20|unique:users,phone',
            'email' => 'nullable|email|max:120|unique:users,email',
            'password' => 'required|string|min:6',
            'permissions' => 'required|array|min:1',
            'permissions.*' => ['string', Rule::in(User::SUPERVISOR_PERMISSIONS)],
        ], [
            'name.required' => 'اسم المشرف مطلوب',
            'username.required' => 'اسم المستخدم مطلوب',
            'username.unique' => 'اسم المستخدم مستخدم مسبقاً',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.unique' => 'رقم الهاتف مسجل مسبقاً',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            'permissions.required' => 'يرجى تحديد صلاحية واحدة على الأقل للمشرف',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $permissions = array_values(array_unique(array_intersect(
            $request->permissions,
            User::SUPERVISOR_PERMISSIONS
        )));

        $supervisor = User::create([
            'name' => trim($request->name),
            'username' => trim($request->username),
            'phone' => preg_replace('/\D/', '', $request->phone) ?: trim($request->phone),
            'email' => $request->email ? trim($request->email) : null,
            'password' => $request->password,
            'role' => 'supervisor',
            'permissions' => $permissions,
            'status' => 'active',
        ]);

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'supervisor_created',
            'target_type' => 'User',
            'target_id' => $supervisor->id,
            'details' => "تم إنشاء حساب المشرف ({$supervisor->name}) بصلاحيات: " . implode(', ', $permissions),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم إضافة المشرف ({$supervisor->name}) بنجاح",
            'supervisor' => $supervisor,
        ], 201);
    }

    /**
     * Update Supervisor details & permissions (Admin-only)
     */
    public function updateSupervisor(Request $request, $id)
    {
        $admin = $request->user();
        $target = User::whereIn('role', ['admin', 'supervisor'])->findOrFail($id);

        if ($target->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعديل صلاحيات حساب مدير النظام الرئيسي من هذه القائمة',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:60|unique:users,username,' . $target->id,
            'phone' => 'required|string|min:7|max:20|unique:users,phone,' . $target->id,
            'email' => 'nullable|email|max:120|unique:users,email,' . $target->id,
            'password' => 'nullable|string|min:6',
            'status' => 'required|in:active,banned',
            'permissions' => 'required|array|min:1',
            'permissions.*' => ['string', Rule::in(User::SUPERVISOR_PERMISSIONS)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $permissions = array_values(array_unique(array_intersect(
            $request->permissions,
            User::SUPERVISOR_PERMISSIONS
        )));

        $target->name = trim($request->name);
        $target->username = trim($request->username);
        $target->phone = preg_replace('/\D/', '', $request->phone) ?: trim($request->phone);
        $target->email = $request->email ? trim($request->email) : null;
        $target->status = $request->status;
        $target->permissions = $permissions;

        if ($request->filled('password')) {
            $target->password = $request->password;
        }

        $target->save();

        if ($target->status === 'banned') {
            $target->tokens()->delete();
        }

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'supervisor_updated',
            'target_type' => 'User',
            'target_id' => $target->id,
            'details' => "تم تعديل بيانات وصلاحيات المشرف ({$target->name})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المشرف وصلاحياته بنجاح',
            'supervisor' => $target->fresh(),
        ]);
    }

    /**
     * Toggle Supervisor active/banned status (Admin-only, protects last Admin)
     */
    public function toggleSupervisorStatus(Request $request, $id)
    {
        $admin = $request->user();
        $target = User::whereIn('role', ['admin', 'supervisor'])->findOrFail($id);

        if ($target->id === $admin->id || $target->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعطيل حساب مدير النظام (الأدمن)',
            ], 403);
        }

        $target->status = $target->status === 'banned' ? 'active' : 'banned';
        $target->save();

        if ($target->status === 'banned') {
            $target->tokens()->delete();
        }

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'supervisor_status_toggled',
            'target_type' => 'User',
            'target_id' => $target->id,
            'details' => "تم تغيير حالة المشرف ({$target->name}) إلى {$target->status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $target->status === 'active' ? 'تم تفعيل حساب المشرف' : 'تم تعطيل حساب المشرف وإلغاء جلساته',
            'supervisor' => $target,
        ]);
    }

    /**
     * Paginated Administrative Audit Logs (Admin-only)
     */
    public function auditLogs(Request $request)
    {
        $action = $request->query('action', 'all');
        $search = trim((string) $request->query('search', ''));
        $perPage = min(max((int) $request->query('per_page', 25), 5), 100);

        $query = AdminLog::with('admin:id,name,username,role');

        if ($action && $action !== 'all') {
            $query->where('action', $action);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('details', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('admin', fn ($aq) => $aq->where('name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'logs' => $logs,
        ]);
    }
}

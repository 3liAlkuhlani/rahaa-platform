<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminPasswordController extends Controller
{
    /**
     * Change Admin Password - ONLY accessible by authenticated Admin inside Dashboard
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        // Ensure user is truly an Admin
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول. هذه العملية مخصصة للمشرف الإداري فقط',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed|different:current_password',
        ], [
            'current_password.required' => 'كلمة المرور الحالية مطلوبة',
            'new_password.required' => 'كلمة المرور الجديدة مطلوبة',
            'new_password.min' => 'يجب ألا تقل كلمة المرور الجديدة عن 6 خانات',
            'new_password.confirmed' => 'تأكيد كلمة المرور الجديدة غير متطابق',
            'new_password.different' => 'يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور الحالية غير صحيحة',
            ], 422);
        }

        // Update password with secure bcrypt hash
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Invalidate old tokens except current if desired, or all tokens
        $user->tokens()->delete();

        // Create new active token for the admin session
        $newToken = $user->createToken('admin-access-token', ['admin'])->plainTextToken;

        // Log admin action safely (without password in plain text)
        AdminLog::create([
            'admin_id' => $user->id,
            'action' => 'password_changed',
            'target_type' => 'User',
            'target_id' => $user->id,
            'details' => 'تم تغيير كلمة مرور المشرف الإداري بنجاح من داخل لوحة التحكم',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث كلمة مرور المشرف بنجاح وتأمين الجلسة',
            'token' => $newToken,
        ]);
    }
}

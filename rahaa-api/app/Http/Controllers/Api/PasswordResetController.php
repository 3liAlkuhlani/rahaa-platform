<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetSms;
use App\Models\User;
use App\Services\SmsService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Step 1: Request SMS Reset Code (Passenger & Driver only)
     */
    public function requestReset(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ], [
            'phone.required' => 'يرجى إدخال رقم الهاتف المسجل لدينا',
        ]);

        $phone = preg_replace('/\D/', '', $request->phone);

        // Apply Rate Limiting (max 3 requests per 10 minutes per IP/phone)
        $throttleKey = 'sms-reset:' . $phone . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد {$seconds} ثانية.",
            ], 429);
        }
        RateLimiter::hit($throttleKey, 600);

        // Verify user exists and is passenger or driver (NOT admin)
        $user = User::where(function ($q) use ($phone, $request) {
            $q->where('phone', $phone)
              ->orWhere('phone', $request->phone);
        })->whereIn('role', ['passenger', 'driver'])->first();

        // Even if user not found, give a standard secure response to prevent account harvesting,
        // EXCEPT if SMS service is unconfigured, where we MUST throw the error as required.
        if (!$this->smsService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'خدمة إرسال رسائل SMS غير مهيأة حالياً في إعدادات الخادم (.env). يرجى مراجعة إدارة النظام.',
            ], 503);
        }

        if (!$user) {
            // Neutral message
            return response()->json([
                'success' => true,
                'message' => 'إذا كان رقم الهاتف مسجلاً، فسيتم إرسال رمز التحقق عبر رسالة SMS.',
            ]);
        }

        // Generate 6-digit cryptographic code
        $code = (string) random_int(100000, 999999);
        $codeHash = Hash::make($code);

        // Invalidate older unused codes for this phone
        PasswordResetSms::where('phone', $phone)->where('used', false)->delete();

        // Save new code with 10 minutes expiry
        PasswordResetSms::create([
            'phone' => $phone,
            'code_hash' => $codeHash,
            'attempts' => 0,
            'used' => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Dispatch real SMS
        try {
            $message = "رمز استعادة كلمة المرور الخاص بك في منصة راحة هو: {$code} - صالح لمدة 10 دقائق.";
            $this->smsService->sendSms($phone, $message);

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال رمز التحقق بنجاح إلى هاتفك عبر رسالة SMS.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Step 2: Verify SMS Code
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'code.required' => 'رمز التحقق مطلوب',
            'code.size' => 'يجب أن يتكون رمز التحقق من 6 أرقام',
        ]);

        $phone = preg_replace('/\D/', '', $request->phone);

        $record = PasswordResetSms::where('phone', $phone)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على طلب استعادة نشط لهذا الرقم',
            ], 404);
        }

        // Check expiration
        if (now()->gt($record->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد',
            ], 410);
        }

        // Check attempts limit (max 5 failed attempts)
        if ($record->attempts >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز جديد',
            ], 429);
        }

        if (!Hash::check($request->code, $record->code_hash)) {
            $record->increment('attempts');
            $remaining = 5 - $record->attempts;
            return response()->json([
                'success' => false,
                'message' => "رمز التحقق غير صحيح. المحاولات المتبقية: {$remaining}",
            ], 422);
        }

        // Code is verified. Return a temporary reset session key or acknowledge validity.
        return response()->json([
            'success' => true,
            'message' => 'تم التحقق من الرمز بنجاح. يمكنك الآن تعيين كلمة المرور الجديدة',
        ]);
    }

    /**
     * Step 3: Set New Password after verification
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'code.required' => 'رمز التحقق مطلوب',
            'password.required' => 'كلمة المرور الجديدة مطلوبة',
            'password.min' => 'يجب ألا تقل كلمة المرور عن 6 خانات',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ]);

        $phone = preg_replace('/\D/', '', $request->phone);

        $record = PasswordResetSms::where('phone', $phone)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$record || now()->gt($record->expires_at) || $record->attempts >= 5 || !Hash::check($request->code, $record->code_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'طلب غير صالح أو منتهي الصلاحية. يرجى إعادة طلب رمز جديد',
            ], 422);
        }

        // Find user
        $user = User::where('phone', $phone)->whereIn('role', ['passenger', 'driver'])->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير موجود',
            ], 404);
        }

        // Update password with secure hash
        $user->password = Hash::make($request->password);
        $user->save();

        // Mark code as used and invalidate all tokens
        $record->used = true;
        $record->save();
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
        ]);
    }
}

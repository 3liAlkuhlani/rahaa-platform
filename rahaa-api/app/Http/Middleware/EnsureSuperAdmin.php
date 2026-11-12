<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Restrict access strictly to full Admin accounts (not Supervisors).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك. هذه الصلاحية مخصصة لمدير النظام (الأدمن) فقط',
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'حساب مدير النظام غير مفعل حالياً',
            ], 403);
        }

        return $next($request);
    }
}

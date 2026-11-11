<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request and verify that the authenticated user is an admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول. هذه العملية مخصصة للمشرف الإداري فقط',
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'حساب المشرف الإداري غير مفعل حالياً',
            ], 403);
        }

        return $next($request);
    }
}


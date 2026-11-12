<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request and verify that the authenticated user is an active Admin or Supervisor.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isAdminOrSupervisor()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول. هذه العملية مخصصة للإدارة والمشرفين فقط',
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'حساب الإدارة أو المشرف غير مفعل حالياً',
            ], 403);
        }

        return $next($request);
    }
}

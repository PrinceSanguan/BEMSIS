<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CaptainMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthorized access',
                ], 401);
            }

            return redirect()->route('auth.login')->with('error', 'Please login to access this page');
        }

        // Check if authenticated user has captain role
        if (Auth::user()->role !== 'captain') {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Access denied. Captain privileges required',
                ], 403);
            }

            return redirect()->route('home')->with('error', 'Access denied. Captain privileges required');
        }

        // User is authenticated and has captain role, proceed
        return $next($request);
    }
}

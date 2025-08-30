<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only track authenticated users
        if (Auth::check()) {
            $user = Auth::user();

            // Update last seen timestamp and mark as online
            // Using a simple cache to prevent too frequent database updates
            $cacheKey = "user_activity_{$user->id}";
            $lastUpdate = cache($cacheKey);

            // Only update if last update was more than 1 minute ago
            if (!$lastUpdate || now()->diffInMinutes($lastUpdate) >= 1) {
                $user->updateLastSeen();
                cache([$cacheKey => now()], now()->addMinutes(5));
            }
        }

        return $next($request);
    }
}

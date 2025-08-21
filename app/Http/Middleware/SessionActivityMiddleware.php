<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SessionActivityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $lastActivity = $request->session()->get('last_activity');
            $now = now()->timestamp;

            // Set initial activity time if not set
            if (!$lastActivity) {
                $request->session()->put('last_activity', $now);
            } else {
                // Check if session has been inactive for more than 15 minutes (900 seconds)
                $inactiveTime = $now - $lastActivity;

                if ($inactiveTime > 900) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    if ($request->wantsJson() || $request->expectsJson()) {
                        return response()->json([
                            'message' => 'Session expired due to inactivity',
                            'redirect' => route('auth.login')
                        ], 401);
                    }

                    return redirect()->route('auth.login')
                        ->with('error', 'Your session has expired due to inactivity. Please login again.');
                }
            }

            // Update last activity time for non-static requests
            if (!$request->isMethod('get') || $request->ajax()) {
                $request->session()->put('last_activity', $now);
            }
        }

        return $next($request);
    }
}

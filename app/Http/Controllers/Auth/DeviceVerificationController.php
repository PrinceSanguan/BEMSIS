<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DeviceVerificationController extends Controller
{
    /**
     * Verify device from email link
     */
    public function verify(Request $request, $token, $deviceId)
    {
        try {
            $device = UserDevice::findOrFail($deviceId);

            if ($device->verifyToken($token)) {
                $device->markAsTrusted();

                Log::info('Device verified successfully', [
                    'user_id' => $device->user_id,
                    'device_id' => $device->id,
                    'ip_address' => $device->ip_address
                ]);

                return Inertia::render('Auth/DeviceVerified', [
                    'message' => 'Device verified successfully! You can now log in without receiving security notifications for this device.',
                    'device' => [
                        'name' => $device->device_name,
                        'platform' => $device->platform,
                        'browser' => $device->browser,
                    ]
                ]);
            } else {
                Log::warning('Invalid device verification token', [
                    'device_id' => $deviceId,
                    'ip_address' => $request->ip()
                ]);

                return Inertia::render('Auth/DeviceVerificationFailed', [
                    'message' => 'Invalid or expired verification link.',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Device verification error', [
                'error' => $e->getMessage(),
                'device_id' => $deviceId
            ]);

            return Inertia::render('Auth/DeviceVerificationFailed', [
                'message' => 'Device verification failed. Please try logging in again.',
            ]);
        }
    }

    /**
     * Show device management page
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $devices = $user->devices()
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'device_name' => $device->device_name,
                    'platform' => $device->platform,
                    'browser' => $device->browser,
                    'ip_address' => $device->ip_address,
                    'is_trusted' => $device->is_trusted,
                    'last_used_at' => $device->last_used_at->format('M j, Y g:i A'),
                    'first_used_at' => $device->first_used_at->format('M j, Y g:i A'),
                ];
            });

        return Inertia::render('Auth/DeviceManagement', [
            'devices' => $devices
        ]);
    }

    /**
     * Revoke device trust
     */
    public function revoke(Request $request, $deviceId)
    {
        $device = UserDevice::where('user_id', $request->user()->id)
            ->findOrFail($deviceId);

        $device->update(['is_trusted' => false, 'verified_at' => null]);

        Log::info('Device trust revoked', [
            'user_id' => $request->user()->id,
            'device_id' => $deviceId
        ]);

        return back()->with('success', 'Device access revoked successfully.');
    }
}

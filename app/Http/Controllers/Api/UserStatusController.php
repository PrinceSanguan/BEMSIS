<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserStatusController extends Controller
{
    /**
     * Get user's online status
     */
    public function getUserStatus(User $user): JsonResponse
    {
        return response()->json([
            'is_online' => $user->isCurrentlyOnline(),
            'last_seen_at' => $user->last_seen_at?->toISOString(),
        ]);
    }

    /**
     * Get multiple users' online status
     */
    public function getUsersStatus(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        $users = User::whereIn('id', $request->user_ids)
            ->select('id', 'name', 'is_online', 'last_seen_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'is_online' => $user->isCurrentlyOnline(),
                    'last_seen_at' => $user->last_seen_at?->toISOString(),
                ];
            });

        return response()->json(['users' => $users]);
    }

    /**
     * Update current user's activity
     */
    public function updateActivity(Request $request): JsonResponse
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        auth()->user()->updateLastSeen();

        return response()->json([
            'message' => 'Activity updated',
            'is_online' => true,
            'last_seen_at' => now()->toISOString()
        ]);
    }

    /**
     * Get online users count
     */
    public function getOnlineUsersCount(): JsonResponse
    {
        $count = User::where('is_online', true)
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->count();

        return response()->json(['count' => $count]);
    }
}

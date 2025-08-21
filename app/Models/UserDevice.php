<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device_hash',
        'device_name',
        'user_agent',
        'ip_address',
        'platform',
        'browser',
        'is_trusted',
        'first_used_at',
        'last_used_at',
        'verification_token',
        'verified_at',
    ];

    protected $casts = [
        'is_trusted' => 'boolean',
        'first_used_at' => 'datetime',
        'last_used_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a unique device hash based on user agent and other factors
     */
    public static function generateDeviceHash(string $userAgent, string $ipAddress, int $userId): string
    {
        // Create a more sophisticated fingerprint that includes user context
        $fingerprint = $userAgent . '|' . self::extractBrowserFingerprint($userAgent) . '|' . $userId;
        return hash('sha256', $fingerprint);
    }

    /**
     * Extract browser-specific fingerprint data
     */
    private static function extractBrowserFingerprint(string $userAgent): string
    {
        // Remove version numbers but keep browser and OS info
        $normalized = preg_replace('/\d+\.\d+[\.\d]*/', 'X.X', $userAgent);
        return $normalized;
    }

    /**
     * Parse user agent to extract platform and browser
     */
    public static function parseUserAgent(string $userAgent): array
    {
        $platform = 'Unknown';
        $browser = 'Unknown';

        // Detect platform
        if (stripos($userAgent, 'Windows') !== false) $platform = 'Windows';
        elseif (stripos($userAgent, 'Mac') !== false) $platform = 'macOS';
        elseif (stripos($userAgent, 'Linux') !== false) $platform = 'Linux';
        elseif (stripos($userAgent, 'Android') !== false) $platform = 'Android';
        elseif (stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false) $platform = 'iOS';

        // Detect browser
        if (stripos($userAgent, 'Chrome') !== false && stripos($userAgent, 'Edg') === false) $browser = 'Chrome';
        elseif (stripos($userAgent, 'Firefox') !== false) $browser = 'Firefox';
        elseif (stripos($userAgent, 'Safari') !== false && stripos($userAgent, 'Chrome') === false) $browser = 'Safari';
        elseif (stripos($userAgent, 'Edg') !== false) $browser = 'Edge';

        return compact('platform', 'browser');
    }

    /**
     * Generate verification token
     */
    public function generateVerificationToken(): string
    {
        $token = Str::random(64);
        $this->update(['verification_token' => Hash::make($token)]);
        return $token;
    }

    /**
     * Verify the token
     */
    public function verifyToken(string $token): bool
    {
        return Hash::check($token, $this->verification_token);
    }

    /**
     * Mark device as trusted
     */
    public function markAsTrusted(): void
    {
        $this->update([
            'is_trusted' => true,
            'verified_at' => now(),
            'verification_token' => null,
        ]);
    }
}

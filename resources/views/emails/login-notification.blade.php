<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert - New Device Login</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.7;
            color: #3a3a3a;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 30px auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .security-icon {
            width: 70px;
            height: 70px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }

        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .email-header p {
            margin: 10px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }

        .email-body {
            background-color: white;
            padding: 40px;
        }

        .alert-box {
            background-color: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .device-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }

        .device-info h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 16px;
        }

        .device-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .device-detail strong {
            color: #374151;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }

        .secondary-button {
            display: inline-block;
            background-color: #6b7280;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 6px;
            font-weight: 500;
            margin: 10px 5px;
            font-size: 14px;
        }

        .email-footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }

        .warning-text {
            color: #dc2626;
            font-weight: 500;
        }

        @media (max-width: 600px) {
            .email-wrapper {
                margin: 10px;
            }

            .email-body {
                padding: 25px;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="security-icon">🔒</div>
            <h1>Security Alert</h1>
            <p>New device login detected</p>
        </div>

        <div class="email-body">
            <div class="alert-box">
                <p><strong>Hello {{ $user->name }},</strong></p>
                <p>We detected a login to your account from a new device. If this was you, please verify this device
                    using the button below.</p>
            </div>

            <div class="device-info">
                <h3>🖥️ Login Details</h3>
                <div class="device-detail">
                    <span><strong>Device:</strong></span>
                    <span>{{ $device->device_name }}</span>
                </div>
                <div class="device-detail">
                    <span><strong>Platform:</strong></span>
                    <span>{{ $device->platform }}</span>
                </div>
                <div class="device-detail">
                    <span><strong>Browser:</strong></span>
                    <span>{{ $device->browser }}</span>
                </div>
                <div class="device-detail">
                    <span><strong>IP Address:</strong></span>
                    <span>{{ $device->ip_address }}</span>
                </div>
                <div class="device-detail">
                    <span><strong>Time:</strong></span>
                    <span>{{ $device->first_used_at->format('M j, Y g:i A T') }}</span>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p><strong>Was this you?</strong></p>
                <a href="{{ $verificationUrl }}" class="cta-button">✅ Yes, This Was Me</a>
            </div>

            <div
                style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 6px; padding: 15px; margin: 25px 0;">
                <p class="warning-text" style="margin: 0;"><strong>⚠️ Important:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">If you did not log in from this device, your account may
                    be compromised. Please change your password immediately and contact support.</p>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                <strong>Security Tips:</strong><br>
                • Always log out from shared computers<br>
                • Use strong, unique passwords<br>
                • Keep your browser updated<br>
                • Don't share your login credentials
            </p>
        </div>

        <div class="email-footer">
            <p>This is an automated security notification from {{ config('app.name') }}.</p>
            <p>If you did not request this, please contact our support team immediately.</p>
            <p style="margin-top: 15px; opacity: 0.7;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>

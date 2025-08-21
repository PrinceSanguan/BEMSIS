<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 30px auto;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background-color: #16a34a;
            color: white;
            padding: 30px;
            text-align: center;
        }

        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }

        .email-body {
            padding: 30px;
        }

        .otp-code {
            background-color: #f8f9fa;
            border: 2px dashed #16a34a;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }

        .otp-number {
            font-size: 32px;
            font-weight: bold;
            color: #16a34a;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }

        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="email-header">
            <h1>Password Reset Request</h1>
        </div>

        <div class="email-body">
            <p>Hello{{ $user->name }},</p>

            <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to continue:
            </p>

            <div class="otp-code">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
                <div class="otp-number">{{ $otp }}</div>
            </div>

            <div class="warning">
                <strong>Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This OTP will expire in <strong>10 minutes</strong></li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>

            <p>If you have any questions or need assistance, please contact our support team.</p>

            <p>Best regards,<br>{{ config('app.name') }} Team</p>
        </div>

        <div class="footer">
            <p>This email was sent to {{ $user->name }}. If you didn't request a password reset, please ignore this
                email.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>

</html>

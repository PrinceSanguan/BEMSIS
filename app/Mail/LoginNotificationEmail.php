<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\UserDevice;

class LoginNotificationEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $device;
    public $verificationUrl;

    public function __construct(User $user, UserDevice $device, string $verificationToken)
    {
        $this->user = $user;
        $this->device = $device;
        $this->verificationUrl = route('auth.device.verify', [
            'token' => $verificationToken,
            'device' => $device->id
        ]);
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'New Device Login Detected - Security Alert',
            from: config('mail.from.address'),
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.login-notification',
        );
    }

    public function attachments()
    {
        return [];
    }
}

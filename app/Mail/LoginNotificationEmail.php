<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\UserDevice;

class LoginNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $device;
    public $verificationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, UserDevice $device, string $verificationToken)
    {
        $this->user = $user;
        $this->device = $device;
        $this->verificationUrl = route('auth.device.verify', [
            'token' => $verificationToken,
            'device' => $device->id
        ]);
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('New Device Login Detected - Security Alert - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.login-notification');
    }
}

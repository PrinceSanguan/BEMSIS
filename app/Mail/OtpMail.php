<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $otp;

    /**
     * Create a new message instance.
     */
    public function __construct($otp, $userName)
    {
        $this->otp = $otp;
        $this->user = (object) ['name' => $userName];
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Password Reset OTP - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.otp');
    }
}

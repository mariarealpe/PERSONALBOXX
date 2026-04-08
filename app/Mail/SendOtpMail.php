<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $context;
    public $targetEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($otp, string $context = 'login_2fa', ?string $targetEmail = null)
    {
        $this->otp = $otp;
        $this->context = $context;
        $this->targetEmail = $targetEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->context === 'email_change'
                ? 'Confirma el cambio de correo'
                : 'Código de verificación 2FA',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'otp' => $this->otp,
                'context' => $this->context,
                'targetEmail' => $this->targetEmail,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}

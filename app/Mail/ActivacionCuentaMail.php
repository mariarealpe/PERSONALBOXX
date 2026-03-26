<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ActivacionCuentaMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $enlaceActivacion;

    public function __construct(
        public User $cliente,
        string $token,
    ) {
        $this->enlaceActivacion = url('/activar-cuenta?token=' . $token);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: '🎉 Activa tu cuenta en Personal Box Armenia');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.activacion-cuenta');
    }

    public function attachments(): array { return []; }
}

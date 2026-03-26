<?php

namespace App\Mail;

use App\Models\Clase;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservaCanceladaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User  $cliente,
        public Clase $clase,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '❌ Reserva cancelada — ' . ($this->clase->tipoClase->nombre ?? 'Clase') . ' · Personal Box',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.reserva-cancelada');
    }

    public function attachments(): array { return []; }
}

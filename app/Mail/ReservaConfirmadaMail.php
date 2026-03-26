<?php

namespace App\Mail;

use App\Models\Clase;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservaConfirmadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User   $cliente,
        public Reserva $reserva,
        public Clase  $clase,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✅ Reserva confirmada — ' . ($this->clase->tipoClase->nombre ?? 'Clase') . ' · Personal Box',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.reserva-confirmada');
    }

    public function attachments(): array { return []; }
}

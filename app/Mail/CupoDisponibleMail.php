<?php

namespace App\Mail;

use App\Models\Clase;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CupoDisponibleMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $urlClases;

    public function __construct(
        public User $cliente,
        public Clase $clase,
    ) {
        // URL con ?clase_id= para que el frontend resalte esa tarjeta
        $this->urlClases = url('/cliente/clases?clase_id=' . $clase->id);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: '🎉 ¡Hay un cupo disponible en tu clase! — Personal Box');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.cupo-disponible');
    }

    public function attachments(): array { return []; }
}

<?php

namespace App\Mail;

use App\Models\Clase;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClaseModificadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Clase $clase,
        public array $cambios,   // ['campo' => ['anterior' => ..., 'nuevo' => ...]]
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Una clase que reservaste ha sido modificada',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.clase-modificada',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

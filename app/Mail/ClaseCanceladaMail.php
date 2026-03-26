<?php

namespace App\Mail;

use App\Models\Clase;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClaseCanceladaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Clase $clase,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Una clase que reservaste ha sido cancelada',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.clase-cancelada',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

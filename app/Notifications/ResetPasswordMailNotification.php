<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordMailNotification extends Notification
{
    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $broker = config('auth.defaults.passwords');
        $expiraMinutos = (int) config("auth.passwords.{$broker}.expire", 60);

        return (new MailMessage)
            ->subject('Restablece tu contraseña en Personal Box Armenia')
            ->view('emails.password-reset', [
                'cliente' => $notifiable,
                'resetUrl' => $resetUrl,
                'expiraMinutos' => $expiraMinutos,
            ]);
    }
}


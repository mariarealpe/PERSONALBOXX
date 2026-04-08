<?php

namespace App\Models;

use App\Notifications\ResetPasswordMailNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'otp_code',
        'otp_expires_at',
        'otp_intentos',       // RF-21: contador de intentos fallidos
        'foto',
        // Flujo de activación de cuenta
        'estado_cuenta',
        'token_activacion',
        'token_expiracion',
        'creado_por',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
        'token_activacion',
    ];

    protected $appends = ['foto_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'otp_expires_at'    => 'datetime',
            'token_expiracion'  => 'datetime',
            'otp_intentos'      => 'integer',
        ];
    }

    public function getFotoUrlAttribute(): ?string
    {
        if ($this->foto) {
            return Storage::disk('public')->url($this->foto);
        }
        return null;
    }

    public function instructor()
    {
        return $this->hasOne(Instructor::class, 'user_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'cliente_id');
    }

    public function clientePlanes()
    {
        return $this->hasMany(ClientePlan::class, 'cliente_id');
    }

    public function creadoPor()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordMailNotification($token));
    }
}

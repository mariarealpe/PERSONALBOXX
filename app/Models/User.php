<?php

namespace App\Models;

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
        'foto',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    protected $appends = ['foto_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'otp_expires_at'    => 'datetime',
        ];
    }

    /**
     * URL pública de la foto de perfil del usuario.
     * Retorna null si no tiene foto asignada.
     */
    public function getFotoUrlAttribute(): ?string
    {
        if ($this->foto) {
            return Storage::disk('public')->url($this->foto);
        }
        return null;
    }

    /**
     * Relación hacia el perfil del instructor (tabla instructores).
     * Permite usar $user->instructor->tarifa_por_clase, etc.
     */
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
}

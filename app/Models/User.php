<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'otp_code',           // ← AGREGAR
        'otp_expires_at',     // ← AGREGAR
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',           // ← OCULTAR en respuestas JSON
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',  // ← AGREGAR
        ];
    }
    // Agregar en app/Models/User.php
    public function reservas()
    {
        return $this->hasMany(\App\Models\Reserva::class, 'cliente_id');
    }

    public function clientePlanes()
    {
        return $this->hasMany(\App\Models\ClientePlan::class, 'cliente_id');
    }
}

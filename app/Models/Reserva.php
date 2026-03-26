<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    protected $table = 'reservas';

    protected $fillable = [
        'cliente_id',
        'clase_id',
        'estado',
        'fecha_reserva',
        'fecha_cancelacion',
        'posicion_espera',
        'notificado_cupo_at',
    ];

    protected $casts = [
        'fecha_reserva'      => 'datetime',
        'fecha_cancelacion'  => 'datetime',
        'notificado_cupo_at' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'clase_id');
    }

    // ── Scopes útiles ────────────────────────────────────────────────────────

    public function scopeConfirmadas($query)
    {
        return $query->where('estado', 'confirmada');
    }

    public function scopeEnEspera($query)
    {
        return $query->where('estado', 'en_espera')->orderBy('posicion_espera');
    }
}

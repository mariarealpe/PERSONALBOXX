<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Clase extends Model
{
    use HasFactory;

    protected $table = 'clases';

    protected $fillable = [
        'horario_clase_id',
        'tipo_clase_id',
        'instructor_id',
        'fecha_hora_inicio',
        'fecha_hora_fin',
        'capacidad_maxima',
        'sala',
        'estado',
    ];

    protected $casts = [
        'fecha_hora_inicio' => 'datetime',
        'fecha_hora_fin'    => 'datetime',
        'capacidad_maxima'  => 'integer',
    ];

    protected $appends = ['cupos_disponibles', 'total_reservas'];

    public function horario()
    {
        return $this->belongsTo(HorarioClase::class, 'horario_clase_id');
    }

    public function tipoClase()
    {
        return $this->belongsTo(TipoClase::class, 'tipo_clase_id');
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'clase_id');
    }

    public function reservasConfirmadas()
    {
        return $this->hasMany(Reserva::class, 'clase_id')->where('estado', 'confirmada');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'clase_id');
    }

    public function getTotalReservasAttribute()
    {
        return $this->reservasConfirmadas()->count();
    }

    public function getCuposDisponiblesAttribute()
    {
        return max(0, $this->capacidad_maxima - $this->total_reservas);
    }
}

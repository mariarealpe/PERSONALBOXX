<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencias';

    protected $fillable = [
        'clase_id',
        'cliente_id',
        'tenia_reserva',
        'hora_registro',
        'registrado_por',
    ];

    protected $casts = [
        'tenia_reserva'  => 'boolean',
        'hora_registro'  => 'datetime',
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'clase_id');
    }

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }
}

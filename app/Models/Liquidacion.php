<?php
// Ruta: app/Models/Liquidacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Liquidacion extends Model
{
    protected $table = 'liquidaciones';

    protected $fillable = [
        'instructor_id',
        'aprobado_por',
        'fecha_inicio',
        'fecha_fin',
        'total_clases',
        'total_asistentes',
        'tipo_tarifa',
        'tarifa_aplicada',
        'total_pago',
        'fecha_pago',
        'notas',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
        'fecha_pago'   => 'date',
        'total_pago'   => 'float',
        'tarifa_aplicada' => 'float',
    ];

    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }

    public function aprobadoPor()
    {
        return $this->belongsTo(User::class, 'aprobado_por');
    }
}

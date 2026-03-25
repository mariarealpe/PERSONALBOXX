<?php

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
        'fecha_inicio'    => 'date',
        'fecha_fin'       => 'date',
        'fecha_pago'      => 'date',
        'tarifa_aplicada' => 'decimal:2',
        'total_pago'      => 'decimal:2',
    ];

    public function instructor()
    {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }

    public function aprobadoPor()
    {
        return $this->belongsTo(User::class, 'aprobado_por');
    }
}

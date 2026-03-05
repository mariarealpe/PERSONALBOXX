<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioClase extends Model
{
    use HasFactory;

    protected $table = 'horarios_clase';

    protected $fillable = [
        'tipo_clase_id',
        'instructor_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'capacidad_maxima',
        'sala',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad_maxima' => 'integer',
    ];

    public function tipoClase()
    {
        return $this->belongsTo(TipoClase::class, 'tipo_clase_id');
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function clases()
    {
        return $this->hasMany(Clase::class, 'horario_clase_id');
    }
}

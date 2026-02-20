<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoClase extends Model
{
    use HasFactory;

    protected $table = 'tipos_clase';

    protected $fillable = [
        'nombre',
        'color',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relaciones
    public function horarios()
    {
        return $this->hasMany(HorarioClase::class, 'tipo_clase_id');
    }

    public function clases()
    {
        return $this->hasMany(Clase::class, 'tipo_clase_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $table = 'planes';

    protected $fillable = [
        'nombre',
        'tipo',
        'clases_por_semana',
        'es_ilimitado',
        'incluye_personalizadas',
        'precio',
        'descripcion',
        'activo',
        'foto',
        'color_fondo',
        'beneficios',
    ];

    protected $casts = [
        'es_ilimitado'          => 'boolean',
        'incluye_personalizadas' => 'boolean',
        'activo'                => 'boolean',
        'precio'                => 'decimal:2',
        'clases_por_semana'     => 'integer',
        'beneficios'            => 'array',
    ];

    public function clientePlanes()
    {
        return $this->hasMany(ClientePlan::class, 'plan_id');
    }
}

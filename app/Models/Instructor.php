<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    use HasFactory;

    protected $table = 'instructores';

    protected $fillable = [
        'user_id',
        'especialidad',
        'tarifa_por_clase',
        'tarifa_por_asistente',
        'biografia',
        'foto',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'tarifa_por_clase' => 'decimal:2',
        'tarifa_por_asistente' => 'decimal:2',
    ];

    protected $appends = ['foto_url'];

    // Relación con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con HorarioClase
    public function horarios()
    {
        return $this->hasMany(HorarioClase::class, 'instructor_id', 'user_id');
    }

    // Relación con Clase
    public function clases()
    {
        return $this->hasMany(Clase::class, 'instructor_id', 'user_id');
    }

    // Relación con SesionesPersonalizadas
    public function sesionesPersonalizadas()
    {
        return $this->hasMany(SesionPersonalizada::class, 'instructor_id', 'user_id');
    }

    // Relación muchos a muchos con TipoClase (especialidades)
    public function especialidades()
    {
        return $this->belongsToMany(TipoClase::class, 'instructor_especialidades', 'instructor_id', 'tipo_clase_id');
    }

    // Accessor para URL de foto
    public function getFotoUrlAttribute()
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }
}

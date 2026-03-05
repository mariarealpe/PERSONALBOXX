<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientePlan extends Model
{
    use HasFactory;

    protected $table = 'cliente_planes';

    protected $fillable = [
        'cliente_id',
        'plan_id',
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
        'clases_usadas_semana',
        'ultima_fecha_reinicio',
    ];

    protected $casts = [
        'fecha_inicio'          => 'date',
        'fecha_vencimiento'     => 'date',
        'ultima_fecha_reinicio' => 'date',
        'clases_usadas_semana'  => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }
}

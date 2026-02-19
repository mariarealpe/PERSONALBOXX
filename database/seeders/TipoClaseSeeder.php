<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoClaseSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            [
                'nombre' => 'Crossfit Musculación',
                'color' => '#FFFFFF',
                'descripcion' => 'Entrenamiento funcional de alta intensidad combinado con musculación',
                'activo' => true
            ],
            [
                'nombre' => 'Boxeo',
                'color' => '#DC143C',
                'descripcion' => 'Clase de boxeo técnico y acondicionamiento',
                'activo' => true
            ],
            [
                'nombre' => 'Boxeo Avanzado',
                'color' => '#8B0000',
                'descripcion' => 'Clase de boxeo para nivel avanzado',
                'activo' => true
            ],
            [
                'nombre' => 'Adultos Activos',
                'color' => '#4169E1',
                'descripcion' => 'Clase de acondicionamiento físico para adultos',
                'activo' => true
            ],
            [
                'nombre' => 'Rumba',
                'color' => '#FFD700',
                'descripcion' => 'Clase de baile y cardio',
                'activo' => true
            ],
        ];

        DB::table('tipos_clase')->insert($tipos);
    }
}

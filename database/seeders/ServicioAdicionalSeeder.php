<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicioAdicionalSeeder extends Seeder
{
    public function run(): void
    {
        $servicios = [
            [
                'nombre' => '1 Clase Semi-personalizada',
                'descripcion' => 'Sesión de entrenamiento semi-personalizado',
                'precio' => 20000,
                'activo' => true
            ],
            [
                'nombre' => '1 Clase Personalizada',
                'descripcion' => 'Sesión de entrenamiento completamente personalizado',
                'precio' => 50000,
                'activo' => true
            ],
            [
                'nombre' => 'Valoración Antropométrica',
                'descripcion' => 'Medición completa de composición corporal',
                'precio' => 60000,
                'activo' => true
            ],
            [
                'nombre' => 'Ejemplo de Menú',
                'descripcion' => 'Plan de alimentación personalizado',
                'precio' => 100000,
                'activo' => true
            ],
            [
                'nombre' => 'Ejemplo de Menú + Valoración Antropométrica',
                'descripcion' => 'Plan de alimentación + medición corporal',
                'precio' => 120000,
                'activo' => true
            ],
            [
                'nombre' => 'Rutina Online',
                'descripcion' => 'Plan de entrenamiento personalizado online',
                'precio' => 100000,
                'activo' => true
            ],
        ];

        DB::table('servicios_adicionales')->insert($servicios);
    }
}

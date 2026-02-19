<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            // Adultos Activos
            [
                'nombre' => 'Adultos Activos 3 días',
                'tipo' => 'adultos_activos',
                'clases_por_semana' => 3,
                'es_ilimitado' => false,
                'incluye_personalizadas' => false,
                'precio' => 159000,
                'descripcion' => '3 clases grupales por semana de cualquier tipo',
                'activo' => true
            ],
            [
                'nombre' => 'Adultos Activos 4 días',
                'tipo' => 'adultos_activos',
                'clases_por_semana' => 4,
                'es_ilimitado' => false,
                'incluye_personalizadas' => false,
                'precio' => 179000,
                'descripcion' => '4 clases grupales por semana de cualquier tipo',
                'activo' => true
            ],

            // Membresías
            [
                'nombre' => 'Membresía Diamante',
                'tipo' => 'membresia',
                'clases_por_semana' => null,
                'es_ilimitado' => true,
                'incluye_personalizadas' => false,
                'precio' => 159000,
                'descripcion' => 'Acceso ilimitado a todas las clases grupales',
                'activo' => true
            ],
            [
                'nombre' => 'Membresía Oro',
                'tipo' => 'membresia',
                'clases_por_semana' => null,
                'es_ilimitado' => true,
                'incluye_personalizadas' => false,
                'precio' => 109000,
                'descripcion' => 'Acceso ilimitado a clases grupales seleccionadas',
                'activo' => true
            ],
            [
                'nombre' => 'Membresía Plata',
                'tipo' => 'membresia',
                'clases_por_semana' => null,
                'es_ilimitado' => true,
                'incluye_personalizadas' => false,
                'precio' => 69000,
                'descripcion' => 'Acceso ilimitado básico a clases grupales',
                'activo' => true
            ],

            // Plan Premium
            [
                'nombre' => 'Plan Premium 4 clases',
                'tipo' => 'premium',
                'clases_por_semana' => 4,
                'es_ilimitado' => false,
                'incluye_personalizadas' => false,
                'precio' => 199000,
                'descripcion' => '4 clases premium por semana',
                'activo' => true
            ],
            [
                'nombre' => 'Plan Premium Ilimitado',
                'tipo' => 'premium',
                'clases_por_semana' => null,
                'es_ilimitado' => true,
                'incluye_personalizadas' => false,
                'precio' => 239000,
                'descripcion' => 'Acceso ilimitado premium a todas las clases',
                'activo' => true
            ],

            // Personalizado (sesiones 1 a 1, NO grupales)
            [
                'nombre' => 'Personalizado 2 días',
                'tipo' => 'personalizado',
                'clases_por_semana' => 2,
                'es_ilimitado' => false,
                'incluye_personalizadas' => true,
                'precio' => 350000,
                'descripcion' => '2 sesiones de entrenamiento personalizado 1 a 1 por semana',
                'activo' => true
            ],
            [
                'nombre' => 'Personalizado 3 días',
                'tipo' => 'personalizado',
                'clases_por_semana' => 3,
                'es_ilimitado' => false,
                'incluye_personalizadas' => true,
                'precio' => 450000,
                'descripcion' => '3 sesiones de entrenamiento personalizado 1 a 1 por semana',
                'activo' => true
            ],
        ];

        DB::table('planes')->insert($planes);
    }
}

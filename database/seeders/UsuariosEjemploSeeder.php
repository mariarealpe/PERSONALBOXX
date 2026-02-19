<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UsuariosEjemploSeeder extends Seeder
{
    public function run(): void
    {
        // Crear administrador
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@personalbox.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('administrador');

        // Crear instructor 1
        $instructor1 = User::create([
            'name' => 'Carlos Instructor',
            'email' => 'instructor1@personalbox.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);
        $instructor1->assignRole('instructor');

        DB::table('instructores')->insert([
            'user_id' => $instructor1->id,
            'especialidad' => 'Crossfit y Musculación',
            'tarifa_por_clase' => 50000,
            'tarifa_por_asistente' => null,
            'biografia' => 'Instructor certificado en Crossfit con 5 años de experiencia',
            'activo' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear instructor 2
        $instructor2 = User::create([
            'name' => 'María Instructora',
            'email' => 'instructor2@personalbox.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);
        $instructor2->assignRole('instructor');

        DB::table('instructores')->insert([
            'user_id' => $instructor2->id,
            'especialidad' => 'Boxeo',
            'tarifa_por_clase' => 55000,
            'tarifa_por_asistente' => null,
            'biografia' => 'Instructora de boxeo profesional',
            'activo' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear clientes de ejemplo
        $cliente1 = User::create([
            'name' => 'Juan Cliente',
            'email' => 'cliente1@personalbox.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);
        $cliente1->assignRole('cliente');

        $cliente2 = User::create([
            'name' => 'Ana Cliente',
            'email' => 'cliente2@personalbox.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);
        $cliente2->assignRole('cliente');
    }
}

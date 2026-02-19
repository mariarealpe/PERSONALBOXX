<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles
        $adminRole = Role::create(['name' => 'administrador']);
        $instructorRole = Role::create(['name' => 'instructor']);
        $clienteRole = Role::create(['name' => 'cliente']);

        // Crear permisos para Administrador
        $adminPermissions = [
            'gestionar-clases',
            'gestionar-instructores',
            'gestionar-clientes',
            'visualizar-reportes',
            'liquidar-pagos',
            'administrar-sistema',
            'gestionar-planes',
            'registrar-asistencia',
        ];

        // Crear permisos para Instructor
        $instructorPermissions = [
            'registrar-asistencia',
            'consultar-inscritos',
            'ver-mis-clases',
        ];

        // Crear permisos para Cliente
        $clientePermissions = [
            'reservar-clases',
            'cancelar-reservas',
            'consultar-mis-reservas',
            'ver-disponibilidad',
        ];

        // Crear todos los permisos
        $allPermissions = array_unique(array_merge(
            $adminPermissions,
            $instructorPermissions,
            $clientePermissions
        ));

        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Asignar permisos a roles
        $adminRole->givePermissionTo($adminPermissions);
        $instructorRole->givePermissionTo($instructorPermissions);
        $clienteRole->givePermissionTo($clientePermissions);
    }
}

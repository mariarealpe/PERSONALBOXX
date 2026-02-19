<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('roles');

        // Determinar qué dashboard mostrar según el rol
        if ($user->hasRole('administrador')) {
            return $this->adminDashboard($user);
        } elseif ($user->hasRole('instructor')) {
            return $this->instructorDashboard($user);
        } elseif ($user->hasRole('cliente')) {
            return $this->clienteDashboard($user);
        }

        abort(403, 'No tienes un rol asignado.');
    }

    private function adminDashboard($user)
    {
        return Inertia::render('Admin/Dashboard', [
            'user' => $user->only(['id', 'name', 'email']),
            'stats' => [
                'total_clientes' => User::role('cliente')->count(),
                'total_instructores' => User::role('instructor')->count(),
                'clases_hoy' => 0,
                'clases_semana' => 0,
            ]
        ]);
    }

    private function instructorDashboard($user)
    {
        return Inertia::render('Instructor/Dashboard', [
            'user' => $user->only(['id', 'name', 'email']),
            'stats' => [
                'clases_hoy' => 0,
                'clases_semana' => 0,
                'total_alumnos' => 0,
            ]
        ]);
    }

    private function clienteDashboard($user)
    {
        return Inertia::render('Cliente/Dashboard', [
            'user' => $user->only(['id', 'name', 'email']),
            'stats' => [
                'reservas_activas' => 0,
                'clases_tomadas' => 0,
                'plan_actual' => null,
            ]
        ]);
    }
}

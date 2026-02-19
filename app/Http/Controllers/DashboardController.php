<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

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
            'user' => $user,
            'stats' => [
                'total_clientes' => \App\Models\User::role('cliente')->count(),
                'total_instructores' => \App\Models\User::role('instructor')->count(),
                'clases_hoy' => 0, // TODO: implementar
                'clases_semana' => 0, // TODO: implementar
            ]
        ]);
    }

    private function instructorDashboard($user)
    {
        return Inertia::render('Instructor/Dashboard', [
            'user' => $user,
            'stats' => [
                'clases_hoy' => 0, // TODO: implementar
                'clases_semana' => 0, // TODO: implementar
                'total_alumnos' => 0, // TODO: implementar
            ]
        ]);
    }

    private function clienteDashboard($user)
    {
        return Inertia::render('Cliente/Dashboard', [
            'user' => $user,
            'stats' => [
                'reservas_activas' => 0, // TODO: implementar
                'clases_tomadas' => 0, // TODO: implementar
                'plan_actual' => null, // TODO: implementar
            ]
        ]);
    }
}

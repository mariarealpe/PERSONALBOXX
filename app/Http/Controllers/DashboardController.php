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
        $inicioSemana = \Carbon\Carbon::now()->startOfWeek(\Carbon\Carbon::MONDAY);
        $finSemana    = \Carbon\Carbon::now()->endOfWeek(\Carbon\Carbon::SUNDAY);

        return Inertia::render('Admin/Dashboard', [
            'user' => $user->only(['id', 'name', 'email']),
            'stats' => [
                'total_clientes'     => \App\Models\User::role('cliente')->count(),
                'total_instructores' => \App\Models\User::role('instructor')->count(),
                'clases_hoy'         => \App\Models\Clase::whereDate('fecha_hora_inicio', today())->where('estado', '!=', 'cancelada')->count(),
                'clases_semana'      => \App\Models\Clase::whereBetween('fecha_hora_inicio', [$inicioSemana, $finSemana])->where('estado', '!=', 'cancelada')->count(),
                'asistencias_hoy'    => \App\Models\Asistencia::whereDate('hora_registro', today())->count(),
            ]
        ]);
    }

    private function instructorDashboard($user)
    {
        $controller = new \App\Http\Controllers\Instructor\InstructorController();
        return $controller->dashboard(request());
    }
    private function clienteDashboard($user)
    {
        return Inertia::render('Cliente/Dashboard', [
            'user' => $user->only(['id', 'name', 'email']),
            'stats' => [
                'reservas_activas' => 0,
                'clases_tomadas'   => 0,
                'plan_actual'      => null,
            ]
        ]);
    }
}

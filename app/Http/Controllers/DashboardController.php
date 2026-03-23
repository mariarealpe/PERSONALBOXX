<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $hoy          = \Carbon\Carbon::today();
        $inicioSemana = \Carbon\Carbon::now()->startOfWeek(\Carbon\Carbon::MONDAY);
        $finSemana    = \Carbon\Carbon::now()->endOfWeek(\Carbon\Carbon::SUNDAY);
        $inicioMes    = \Carbon\Carbon::now()->startOfMonth();
        $finMes       = \Carbon\Carbon::now()->endOfMonth();

        $stats = [
            'total_clientes'       => \App\Models\User::role('cliente')->count(),
            'total_instructores'   => \App\Models\User::role('instructor')->count(),
            'clases_hoy'           => \App\Models\Clase::whereDate('fecha_hora_inicio', $hoy)->where('estado','!=','cancelada')->count(),
            'clases_semana'        => \App\Models\Clase::whereBetween('fecha_hora_inicio',[$inicioSemana,$finSemana])->where('estado','!=','cancelada')->count(),
            'clases_mes'           => \App\Models\Clase::whereBetween('fecha_hora_inicio',[$inicioMes,$finMes])->where('estado','!=','cancelada')->count(),
            'asistencias_hoy'      => \App\Models\Asistencia::whereDate('hora_registro', $hoy)->count(),
            'asistencias_semana'   => \App\Models\Asistencia::whereBetween('hora_registro',[$inicioSemana,$finSemana])->count(),
            'asistencias_mes'      => \App\Models\Asistencia::whereBetween('hora_registro',[$inicioMes,$finMes])->count(),
            'reservas_hoy'         => \App\Models\Reserva::whereDate('created_at', $hoy)->where('estado','confirmada')->count(),
            'tasa_ocupacion_mes'   => $this->calcularTasaOcupacion($inicioMes, $finMes),
            'clientes_activos_mes' => \App\Models\Asistencia::whereBetween('hora_registro',[$inicioMes,$finMes])
                ->distinct('cliente_id')->count('cliente_id'),
        ];

        $asistenciaPorDia = collect(range(6, 0))->map(function ($diasAtras) {
            $fecha = \Carbon\Carbon::today()->subDays($diasAtras);
            return [
                'fecha' => $fecha->format('Y-m-d'),
                'dia'   => $fecha->locale('es')->isoFormat('ddd'),
                'total' => \App\Models\Asistencia::whereDate('hora_registro', $fecha)->count(),
            ];
        });

        $asistenciaPorMes = collect(range(5, 0))->map(function ($mesesAtras) {
            $fecha = \Carbon\Carbon::now()->subMonths($mesesAtras);
            return [
                'mes'   => $fecha->locale('es')->isoFormat('MMM'),
                'total' => \App\Models\Asistencia::whereYear('hora_registro', $fecha->year)
                    ->whereMonth('hora_registro', $fecha->month)->count(),
            ];
        });

        $clasesPopulares = \App\Models\Clase::with('tipoClase')
            ->withCount('asistencias')
            ->whereBetween('fecha_hora_inicio', [$inicioMes, $finMes])
            ->where('estado', 'finalizada')
            ->orderByDesc('asistencias_count')
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'nombre'     => $c->tipoClase?->nombre ?? '—',
                'color'      => $c->tipoClase?->color ?? '#FF1493',
                'asistentes' => $c->asistencias_count,
            ]);

        $horariosDemanda = \App\Models\Clase::selectRaw('HOUR(fecha_hora_inicio) as hora, COUNT(*) as total')
            ->whereBetween('fecha_hora_inicio', [$inicioMes, $finMes])
            ->where('estado', '!=', 'cancelada')
            ->groupBy('hora')
            ->orderBy('hora')
            ->get()
            ->map(fn($h) => [
                'hora'  => str_pad($h->hora, 2, '0', STR_PAD_LEFT) . ':00',
                'total' => $h->total,
            ]);

        $proximasClases = \App\Models\Clase::with(['tipoClase', 'instructor'])
            ->withCount(['reservas as reservas_count' => fn($q) => $q->where('estado','confirmada')])
            ->whereDate('fecha_hora_inicio', $hoy)
            ->where('estado','!=','cancelada')
            ->orderBy('fecha_hora_inicio')
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'nombre'     => $c->tipoClase?->nombre ?? '—',
                'color'      => $c->tipoClase?->color ?? '#FF1493',
                'instructor' => $c->instructor?->name ?? '—',
                'hora'       => \Carbon\Carbon::parse($c->fecha_hora_inicio)->format('H:i'),
                'reservas'   => $c->reservas_count,
                'capacidad'  => $c->capacidad_maxima,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'user'             => $user->only(['id', 'name', 'email']) + ['foto_url' => $user->foto_url],
            'stats'            => $stats,
            'asistenciaPorDia' => $asistenciaPorDia,
            'asistenciaPorMes' => $asistenciaPorMes,
            'clasesPopulares'  => $clasesPopulares,
            'horariosDemanda'  => $horariosDemanda,
            'proximasClases'   => $proximasClases,
        ]);
    }

    private function calcularTasaOcupacion($inicio, $fin): float
    {
        $clases = \App\Models\Clase::withCount(['reservas as reservas_count' => fn($q) => $q->where('estado','confirmada')])
            ->whereBetween('fecha_hora_inicio', [$inicio, $fin])
            ->where('estado', '!=', 'cancelada')
            ->where('capacidad_maxima', '>', 0)
            ->get();

        if ($clases->isEmpty()) return 0;

        $total = $clases->sum(fn($c) => $c->reservas_count / $c->capacidad_maxima);
        return round(($total / $clases->count()) * 100, 1);
    }

    private function instructorDashboard($user)
    {
        $controller = new \App\Http\Controllers\Instructor\InstructorController();
        return $controller->dashboard(request());
    }

    private function clienteDashboard($user)
    {
        $controller = new \App\Http\Controllers\Cliente\ClienteController();
        return $controller->dashboard(request());
    }
}

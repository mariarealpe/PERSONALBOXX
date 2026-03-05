<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\Asistencia;
use App\Models\User;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReporteController extends Controller
{
    public function index()
    {
        // Dashboard de estadísticas generales
        $hoy           = now()->startOfDay();
        $inicioSemana  = now()->startOfWeek(Carbon::MONDAY);
        $finSemana     = now()->endOfWeek(Carbon::SUNDAY);
        $inicioMes     = now()->startOfMonth();

        $stats = [
            'clases_hoy'           => Clase::whereDate('fecha_hora_inicio', today())->where('estado', '!=', 'cancelada')->count(),
            'clases_semana'        => Clase::whereBetween('fecha_hora_inicio', [$inicioSemana, $finSemana])->where('estado', '!=', 'cancelada')->count(),
            'clases_mes'           => Clase::whereMonth('fecha_hora_inicio', now()->month)->whereYear('fecha_hora_inicio', now()->year)->where('estado', '!=', 'cancelada')->count(),
            'total_clientes'       => User::role('cliente')->count(),
            'total_instructores'   => User::role('instructor')->count(),
            'asistencias_hoy'      => Asistencia::whereDate('hora_registro', today())->count(),
            'asistencias_semana'   => Asistencia::whereBetween('hora_registro', [$inicioSemana, $finSemana])->count(),
            'asistencias_mes'      => Asistencia::whereMonth('hora_registro', now()->month)->whereYear('hora_registro', now()->year)->count(),
        ];

        // Clases más populares (último mes)
        $clasesPopulares = Clase::with('tipoClase')
            ->withCount('asistencias')
            ->where('fecha_hora_inicio', '>=', $inicioMes)
            ->where('estado', '!=', 'cancelada')
            ->orderByDesc('asistencias_count')
            ->limit(5)
            ->get();

        // Asistencia por día esta semana
        $asistenciaPorDia = [];
        for ($i = 0; $i < 7; $i++) {
            $dia = $inicioSemana->copy()->addDays($i);
            $asistenciaPorDia[] = [
                'dia'   => $dia->translatedFormat('D'),
                'fecha' => $dia->format('Y-m-d'),
                'total' => Asistencia::whereDate('hora_registro', $dia)->count(),
            ];
        }

        return Inertia::render('Admin/Reportes/Index', [
            'stats'            => $stats,
            'clasesPopulares'  => $clasesPopulares,
            'asistenciaPorDia' => $asistenciaPorDia,
        ]);
    }

    public function asistenciaClase(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'required|date|after_or_equal:fecha_inicio',
            'instructor_id' => 'nullable|exists:users,id',
            'tipo_clase_id' => 'nullable|exists:tipos_clase,id',
        ]);

        $clases = Clase::with(['tipoClase', 'instructor', 'asistencias.cliente'])
            ->withCount(['reservasConfirmadas', 'asistencias'])
            ->whereBetween('fecha_hora_inicio', [$validated['fecha_inicio'], Carbon::parse($validated['fecha_fin'])->endOfDay()])
            ->when($validated['instructor_id'] ?? null, fn($q, $v) => $q->where('instructor_id', $v))
            ->when($validated['tipo_clase_id'] ?? null, fn($q, $v) => $q->where('tipo_clase_id', $v))
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora_inicio')
            ->get();

        $instructores = User::role('instructor')->orderBy('name')->get(['id', 'name']);
        $tiposClase   = \App\Models\TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre']);

        return Inertia::render('Admin/Reportes/AsistenciaClase', [
            'clases'      => $clases,
            'instructores' => $instructores,
            'tiposClase'  => $tiposClase,
            'filters'     => $validated,
        ]);
    }

    public function liquidacionInstructor(Request $request)
    {
        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $instructor = User::with('instructor')->find($validated['instructor_id']);

        $clases = Clase::with(['tipoClase', 'asistencias'])
            ->withCount('asistencias')
            ->where('instructor_id', $validated['instructor_id'])
            ->whereBetween('fecha_hora_inicio', [$validated['fecha_inicio'], Carbon::parse($validated['fecha_fin'])->endOfDay()])
            ->where('estado', 'finalizada')
            ->orderBy('fecha_hora_inicio')
            ->get();

        $tarifaPorClase     = optional($instructor->instructor)->tarifa_por_clase ?? 0;
        $tarifaPorAsistente = optional($instructor->instructor)->tarifa_por_asistente ?? 0;

        $totalPago = 0;
        foreach ($clases as $clase) {
            if ($tarifaPorAsistente > 0) {
                $clase->pago = $clase->asistencias_count * $tarifaPorAsistente;
            } else {
                $clase->pago = $tarifaPorClase;
            }
            $totalPago += $clase->pago;
        }

        $instructores = User::role('instructor')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Reportes/Liquidacion', [
            'instructor'  => $instructor,
            'clases'      => $clases,
            'totalPago'   => $totalPago,
            'tarifas'     => ['por_clase' => $tarifaPorClase, 'por_asistente' => $tarifaPorAsistente],
            'instructores' => $instructores,
            'filters'     => $validated,
        ]);
    }
}

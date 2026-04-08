<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\Asistencia;
use App\Models\Liquidacion;
use App\Models\TipoClase;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReporteController extends Controller
{
    public function index()
    {
        $inicioSemana = now()->startOfWeek(Carbon::MONDAY);
        $finSemana    = now()->endOfWeek(Carbon::SUNDAY);
        $inicioMes    = now()->startOfMonth();

        $stats = [
            'clases_hoy'         => Clase::whereDate('fecha_hora_inicio', today())->where('estado', '!=', 'cancelada')->count(),
            'clases_semana'      => Clase::whereBetween('fecha_hora_inicio', [$inicioSemana, $finSemana])->where('estado', '!=', 'cancelada')->count(),
            'clases_mes'         => Clase::whereMonth('fecha_hora_inicio', now()->month)->whereYear('fecha_hora_inicio', now()->year)->where('estado', '!=', 'cancelada')->count(),
            'total_clientes'     => User::role('cliente')->count(),
            'total_instructores' => User::role('instructor')->count(),
            'asistencias_hoy'    => Asistencia::whereDate('hora_registro', today())->count(),
            'asistencias_semana' => Asistencia::whereBetween('hora_registro', [$inicioSemana, $finSemana])->count(),
            'asistencias_mes'    => Asistencia::whereMonth('hora_registro', now()->month)->whereYear('hora_registro', now()->year)->count(),
        ];

        $clasesPopulares = Clase::with('tipoClase')
            ->withCount('asistencias')
            ->where('fecha_hora_inicio', '>=', $inicioMes)
            ->where('estado', '!=', 'cancelada')
            ->orderByDesc('asistencias_count')
            ->limit(5)
            ->get();

        $asistenciaPorDia = [];
        for ($i = 0; $i < 7; $i++) {
            $dia = $inicioSemana->copy()->addDays($i);
            $asistenciaPorDia[] = [
                'dia'   => $dia->locale('es')->isoFormat('ddd'),
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
        if (!$request->hasAny(['fecha_inicio', 'fecha_fin'])) {
            $instructores = User::role('instructor')->orderBy('name')->get(['id', 'name']);
            $tiposClase   = TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre']);

            return Inertia::render('Admin/Reportes/AsistenciaClase', [
                'clases'       => [],
                'instructores' => $instructores,
                'tiposClase'   => $tiposClase,
                'filters'      => [
                    'fecha_inicio'  => now()->startOfMonth()->format('Y-m-d'),
                    'fecha_fin'     => now()->format('Y-m-d'),
                    'instructor_id' => '',
                    'tipo_clase_id' => '',
                ],
            ]);
        }

        $validated = $request->validate([
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'required|date|after_or_equal:fecha_inicio',
            'instructor_id' => 'nullable|exists:users,id',
            'tipo_clase_id' => 'nullable|exists:tipos_clase,id',
        ]);

        $clases = Clase::with(['tipoClase', 'instructor', 'asistencias.cliente'])
            ->withCount(['reservasConfirmadas', 'asistencias'])
            ->whereBetween('fecha_hora_inicio', [
                $validated['fecha_inicio'],
                Carbon::parse($validated['fecha_fin'])->endOfDay()
            ])
            ->when($validated['instructor_id'] ?? null, fn($q, $v) => $q->where('instructor_id', $v))
            ->when($validated['tipo_clase_id'] ?? null, fn($q, $v) => $q->where('tipo_clase_id', $v))
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora_inicio')
            ->get();

        $instructores = User::role('instructor')->orderBy('name')->get(['id', 'name']);
        $tiposClase   = TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre']);

        return Inertia::render('Admin/Reportes/AsistenciaClase', [
            'clases'       => $clases,
            'instructores' => $instructores,
            'tiposClase'   => $tiposClase,
            'filters'      => $validated,
        ]);
    }

    public function liquidacionInstructor(Request $request)
    {
        $instructores = User::role('instructor')->orderBy('name')->get(['id', 'name']);

        if (!$request->hasAny(['instructor_id', 'fecha_inicio', 'fecha_fin'])) {
            return Inertia::render('Admin/Reportes/Liquidacion', [
                'instructor'     => null,
                'clases'         => [],
                'totalPago'      => 0,
                'tarifas'        => ['por_clase' => 0, 'por_asistente' => 0],
                'instructores'   => $instructores,
                'pagoRegistrado' => null,
                'filters'        => [
                    'instructor_id' => '',
                    'fecha_inicio'  => now()->startOfMonth()->format('Y-m-d'),
                    'fecha_fin'     => now()->format('Y-m-d'),
                ],
            ]);
        }

        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $instructor      = User::with('instructor')->find($validated['instructor_id']);
        $instructorModel = $instructor->instructor;

        $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
        $fechaFin    = Carbon::parse($validated['fecha_fin'])->endOfDay();

        $tarifaPorClase     = optional($instructorModel)->tarifa_por_clase ?? 0;
        $tarifaPorAsistente = optional($instructorModel)->tarifa_por_asistente ?? 0;

        // ── Obtener clases finalizadas del instructor en el período ────────
        $clases = Clase::with(['tipoClase', 'asistencias'])
            ->withCount('asistencias')
            ->where('instructor_id', $validated['instructor_id'])
            ->whereBetween('fecha_hora_inicio', [$fechaInicio, $fechaFin])
            ->where('estado', 'finalizada')
            ->orderBy('fecha_hora_inicio')
            ->get();

        $totalPago = 0;
        foreach ($clases as $clase) {
            $base = $tarifaPorClase > 0 ? $tarifaPorClase : 0;
            $variable = $tarifaPorAsistente > 0 ? ($clase->asistencias_count * $tarifaPorAsistente) : 0;

            // Regla mixta: base + variable
            $clase->pago = $base + $variable;
            $totalPago += $clase->pago;
        }

        // ── Lógica de pagoRegistrado ───────────────────────────────────────
        //
        // PROBLEMA ANTERIOR: se usaba solapamiento de fechas para detectar si
        // ya se había pagado. Eso bloqueaba al admin aunque las clases anteriores
        // ya habían sido eliminadas al liquidar, y las clases actuales son nuevas.
        //
        // SOLUCIÓN: el indicador de "ya pagado" se basa en si quedan clases
        // finalizadas pendientes en el período, no en las fechas del historial.
        //
        // Reglas:
        //  - Si hay clases finalizadas en el período → hay cobro pendiente,
        //    mostrar el último pago del historial solo como REFERENCIA informativa
        //    pero SIN bloquear el botón "Marcar como Pagado".
        //  - Si NO hay clases finalizadas → no hay nada que pagar; mostrar
        //    el último pago registrado como confirmación de que ya está al día.
        //
        $hayClasesPendientes = $clases->isNotEmpty();
        $pagoRegistrado      = null;

        if ($instructorModel) {
            $ultimaLiquidacion = Liquidacion::where('instructor_id', $instructorModel->id)
                ->orderByDesc('fecha_pago')
                ->orderByDesc('created_at')
                ->first();

            if ($ultimaLiquidacion) {
                $pagoRegistrado = [
                    'id'                  => $ultimaLiquidacion->id,
                    'total_pago'          => $ultimaLiquidacion->total_pago,
                    'fecha_pago'          => $ultimaLiquidacion->fecha_pago->format('d/m/Y'),
                    'fecha_inicio'        => $ultimaLiquidacion->fecha_inicio->format('d/m/Y'),
                    'fecha_fin'           => $ultimaLiquidacion->fecha_fin->format('d/m/Y'),
                    'notas'               => $ultimaLiquidacion->notas,
                    // Esta clave es la clave: si hay clases pendientes el frontend
                    // NO bloquea el botón aunque exista historial previo.
                    'hay_clases_pendientes' => $hayClasesPendientes,
                ];
            }
        }

        return Inertia::render('Admin/Reportes/Liquidacion', [
            'instructor'     => $instructor,
            'clases'         => $clases,
            'totalPago'      => $totalPago,
            'tarifas'        => ['por_clase' => $tarifaPorClase, 'por_asistente' => $tarifaPorAsistente],
            'instructores'   => $instructores,
            'pagoRegistrado' => $pagoRegistrado,
            'filters'        => $validated,
        ]);
    }
}

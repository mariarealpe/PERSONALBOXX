<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Clase;
use App\Models\Instructor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstructorController extends Controller
{
    // ── Helper: obtiene el perfil instructor del usuario autenticado ───────────
    private function getInstructor(Request $request): Instructor
    {
        return Instructor::where('user_id', $request->user()->id)->firstOrFail();
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    public function dashboard(Request $request)
    {
        $user       = $request->user()->load('roles');
        $instructor = $this->getInstructor($request);

        $inicioSemana = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $finSemana    = Carbon::now()->endOfWeek(Carbon::SUNDAY);

        $clasesHoy = Clase::with(['tipoClase', 'reservasConfirmadas'])
            ->where('instructor_id', $user->id)
            ->whereDate('fecha_hora_inicio', today())
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora_inicio')
            ->get()
            ->map(function ($clase) {
                $clase->total_reservas = $clase->reservasConfirmadas->count();
                return $clase;
            });

        $clasesSemana = Clase::where('instructor_id', $user->id)
            ->whereBetween('fecha_hora_inicio', [$inicioSemana, $finSemana])
            ->where('estado', '!=', 'cancelada')
            ->count();

        $totalAlumnos = Asistencia::whereHas(
            'clase', fn($q) => $q->where('instructor_id', $user->id)
        )->distinct('cliente_id')->count('cliente_id');

        $asistenciasHoy = Asistencia::whereHas('clase', function ($q) use ($user) {
            $q->where('instructor_id', $user->id)
                ->whereDate('fecha_hora_inicio', today());
        })->count();

        return Inertia::render('Instructor/Dashboard', [
            'user'      => $user->only(['id', 'name', 'email']),
            'clasesHoy' => $clasesHoy,
            'stats'     => [
                'clases_hoy'      => $clasesHoy->count(),
                'clases_semana'   => $clasesSemana,
                'total_alumnos'   => $totalAlumnos,
                'asistencias_hoy' => $asistenciasHoy,
            ],
        ]);
    }

    // ── MIS CLASES ────────────────────────────────────────────────────────────
    public function clases(Request $request)
    {
        $user = $request->user();

        $clases = Clase::with(['tipoClase', 'reservasConfirmadas'])
            ->withCount('asistencias')
            ->where('instructor_id', $user->id)
            ->when($request->fecha,  fn($q, $f) => $q->whereDate('fecha_hora_inicio', $f))
            ->when($request->estado, fn($q, $e) => $q->where('estado', $e))
            ->orderBy('fecha_hora_inicio', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($clase) {
                $clase->total_reservas = $clase->reservasConfirmadas->count();
                return $clase;
            });

        return Inertia::render('Instructor/Clases', [
            'user'    => $request->user()->only(['id', 'name', 'email']),
            'clases'  => $clases,
            'filters' => $request->only(['fecha', 'estado']),
        ]);
    }

    // ── ASISTENCIAS (vista) ───────────────────────────────────────────────────
    public function asistencias(Request $request)
    {
        $user  = $request->user();
        $fecha = $request->fecha ?? today()->toDateString();

        $clases = Clase::with(['tipoClase', 'reservasConfirmadas'])
            ->where('instructor_id', $user->id)
            ->whereDate('fecha_hora_inicio', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora_inicio')
            ->get()
            ->map(function ($clase) {
                $clase->total_reservas = $clase->reservasConfirmadas->count();
                return $clase;
            });

        $claseSeleccionada = null;
        $asistencias       = collect();
        $reservas          = collect();

        if ($request->clase_id) {
            $claseSeleccionada = Clase::with('tipoClase')
                ->where('instructor_id', $user->id)
                ->findOrFail($request->clase_id);

            $asistencias = Asistencia::with('cliente:id,name,email')
                ->where('clase_id', $claseSeleccionada->id)
                ->get();

            $reservas = $claseSeleccionada->reservasConfirmadas()
                ->with('cliente:id,name,email')
                ->get();
        }

        return Inertia::render('Instructor/Asistencias', [
            'user'              => $user->only(['id', 'name', 'email']),
            'clases'            => $clases,
            'claseSeleccionada' => $claseSeleccionada,
            'asistencias'       => $asistencias,
            'reservas'          => $reservas,
            'filters'           => ['fecha' => $fecha, 'clase_id' => $request->clase_id],
        ]);
    }

    // ── REGISTRAR ASISTENCIA (POST) ───────────────────────────────────────────
    public function registrarAsistencia(Request $request)
    {
        $request->validate([
            'clase_id'   => 'required|exists:clases,id',
            'cliente_id' => 'required|exists:users,id',
        ]);

        $user  = $request->user();
        $clase = Clase::where('id', $request->clase_id)
            ->where('instructor_id', $user->id)
            ->firstOrFail();

        if (in_array($clase->estado, ['finalizada', 'cancelada'])) {
            return back()->withErrors(['asistencia' => 'No se puede registrar asistencia en una clase finalizada o cancelada.']);
        }

        if (Asistencia::where('clase_id', $clase->id)->where('cliente_id', $request->cliente_id)->exists()) {
            return back()->withErrors(['asistencia' => 'Este alumno ya tiene asistencia registrada.']);
        }

        $tenia_reserva = $clase->reservasConfirmadas()
            ->where('cliente_id', $request->cliente_id)
            ->exists();

        Asistencia::create([
            'clase_id'       => $clase->id,
            'cliente_id'     => $request->cliente_id,
            'tenia_reserva'  => $tenia_reserva,
            'hora_registro'  => now(),
            'registrado_por' => $user->id,
        ]);

        return back()->with('success', 'Asistencia registrada correctamente.');
    }

    // ── ELIMINAR ASISTENCIA (DELETE) ──────────────────────────────────────────
    public function eliminarAsistencia(Request $request, Asistencia $asistencia)
    {
        $user = $request->user();

        // Verificar que la clase pertenece al instructor
        Clase::where('id', $asistencia->clase_id)
            ->where('instructor_id', $user->id)
            ->firstOrFail();

        $asistencia->delete();

        return back()->with('success', 'Asistencia eliminada.');
    }

    // ── LIQUIDACIÓN ───────────────────────────────────────────────────────────
    public function liquidacion(Request $request)
    {
        $user       = $request->user();
        $instructor = $this->getInstructor($request);

        $clases       = collect();
        $totales      = null;
        $periodoLabel = '';

        if ($request->hasAny(['fecha_inicio', 'fecha_fin'])) {
            $request->validate([
                'fecha_inicio' => 'required|date',
                'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            ], [
                'fecha_inicio.required'    => 'La fecha de inicio es requerida.',
                'fecha_fin.required'       => 'La fecha fin es requerida.',
                'fecha_fin.after_or_equal' => 'La fecha fin debe ser igual o posterior a la fecha de inicio.',
            ]);

            $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
            $fechaFin    = Carbon::parse($request->fecha_fin)->endOfDay();

            $clases = Clase::with('tipoClase')
                ->withCount('asistencias')
                ->where('instructor_id', $user->id)
                ->where('estado', 'finalizada')
                ->whereBetween('fecha_hora_inicio', [$fechaInicio, $fechaFin])
                ->orderBy('fecha_hora_inicio')
                ->get()
                ->map(function ($clase) use ($instructor) {
                    $asistentes      = $clase->asistencias_count;
                    $clase->pago     = $instructor->tarifa_por_asistente > 0
                        ? $instructor->tarifa_por_asistente * $asistentes
                        : $instructor->tarifa_por_clase;
                    $clase->total_asistentes = $asistentes;
                    return $clase;
                });

            $totales = [
                'total_clases'     => $clases->count(),
                'total_asistentes' => $clases->sum('total_asistentes'),
                'total_pago'       => $clases->sum('pago'),
            ];

            $periodoLabel = Carbon::parse($request->fecha_inicio)->format('d/m/Y')
                . ' – '
                . Carbon::parse($request->fecha_fin)->format('d/m/Y');
        }

        return Inertia::render('Instructor/Liquidacion', [
            'user'         => $user->only(['id', 'name', 'email']),
            'instructor'   => $instructor->only(['tarifa_por_clase', 'tarifa_por_asistente']),
            'clases'       => $clases,
            'totales'      => $totales,
            'filters'      => $request->only(['fecha_inicio', 'fecha_fin']),
            'periodoLabel' => $periodoLabel,
        ]);
    }
}













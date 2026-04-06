<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\Liquidacion;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class LiquidacionHistorialController extends Controller
{
    /**
     * Listado de liquidaciones registradas.
     */
    public function index(Request $request)
    {
        $liquidaciones = Liquidacion::with(['instructor.user'])
            ->orderByDesc('fecha_pago')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($l) => [
                'id'               => $l->id,
                'instructor_nombre'=> $l->instructor?->user?->name ?? '—',
                'fecha_inicio'     => $l->fecha_inicio,
                'fecha_fin'        => $l->fecha_fin,
                'total_clases'     => $l->total_clases,
                'total_asistentes' => $l->total_asistentes,
                'tipo_tarifa'      => $l->tipo_tarifa,
                'tarifa_aplicada'  => $l->tarifa_aplicada,
                'total_pago'       => $l->total_pago,
                'fecha_pago'       => $l->fecha_pago,
                'notas'            => $l->notas,
                'created_at'       => $l->created_at,
            ]);

        return Inertia::render('Admin/Reportes/LiquidacionHistorial', [
            'liquidaciones' => $liquidaciones,
        ]);
    }

    /**
     * Registrar pago y eliminar las clases ya liquidadas.
     *
     * Flujo:
     *  1. Guarda el registro contable en `liquidaciones`.
     *  2. Elimina todas las clases finalizadas del instructor en ese período.
     *     → Las asistencias y reservas se borran en cascada (ON DELETE CASCADE).
     *
     * Todo ocurre en una transacción: si algo falla, no queda ningún cambio a medias.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'instructor_id'    => 'required|exists:users,id',
            'fecha_inicio'     => 'required|date',
            'fecha_fin'        => 'required|date|after_or_equal:fecha_inicio',
            'total_clases'     => 'required|integer|min:0',
            'total_asistentes' => 'required|integer|min:0',
            'tipo_tarifa'      => 'required|string',
            'tarifa_aplicada'  => 'required|numeric|min:0',
            'total_pago'       => 'required|numeric|min:0',
            'fecha_pago'       => 'required|date',
            'notas'            => 'nullable|string|max:1000',
        ]);

        // El JSX envía instructor_id = users.id (ej: 23)
        // La tabla `liquidaciones` guarda instructores.id (ej: 1) → hay que buscar el modelo
        $instructorModel = Instructor::where('user_id', $validated['instructor_id'])->firstOrFail();

        $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
        $fechaFin    = Carbon::parse($validated['fecha_fin'])->endOfDay();

        DB::transaction(function () use ($validated, $instructorModel, $fechaInicio, $fechaFin) {

            // ── PASO 1: Guardar registro de liquidación ────────────────────
            Liquidacion::create([
                'instructor_id'    => $instructorModel->id,   // instructores.id
                'aprobado_por'     => Auth::id(),
                'fecha_inicio'     => $validated['fecha_inicio'],
                'fecha_fin'        => $validated['fecha_fin'],
                'total_clases'     => $validated['total_clases'],
                'total_asistentes' => $validated['total_asistentes'],
                'tipo_tarifa'      => $validated['tipo_tarifa'],
                'tarifa_aplicada'  => $validated['tarifa_aplicada'],
                'total_pago'       => $validated['total_pago'],
                'fecha_pago'       => $validated['fecha_pago'],
                'notas'            => $validated['notas'] ?? null,
            ]);

            // ── PASO 2: Eliminar clases finalizadas del instructor en el período ──
            //
            // En la tabla `clases`, instructor_id = users.id (no instructores.id).
            // Por eso usamos $validated['instructor_id'] directamente aquí.
            //
            // Las asistencias y reservas vinculadas a estas clases se eliminan
            // automáticamente gracias a:
            //   FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
            Clase::where('instructor_id', $validated['instructor_id'])
                ->where('estado', 'finalizada')
                ->whereBetween('fecha_hora_inicio', [$fechaInicio, $fechaFin])
                ->delete();
        });

        return redirect()
            ->route('admin.reportes.liquidacion', [
                'instructor_id' => $validated['instructor_id'],
                'fecha_inicio'  => $validated['fecha_inicio'],
                'fecha_fin'     => $validated['fecha_fin'],
            ])
            ->with('success', '✅ Pago registrado. Las clases liquidadas fueron eliminadas.');
    }

    /**
     * Eliminar un registro del historial de pagos.
     * Las clases ya no existen (se borraron al pagar), así que esto
     * solo elimina el registro contable de la tabla liquidaciones.
     */
    public function destroy(Liquidacion $liquidacion)
    {
        $liquidacion->delete();

        return back()->with('success', 'Registro de liquidación eliminado.');
    }
}

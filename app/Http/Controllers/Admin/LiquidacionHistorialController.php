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
            'fecha_pago'       => 'required|date',
            'notas'            => 'nullable|string|max:1000',
            // Se reciben pero NO se confían desde frontend:
            'total_clases'     => 'nullable',
            'total_asistentes' => 'nullable',
            'tipo_tarifa'      => 'nullable',
            'tarifa_aplicada'  => 'nullable',
            'total_pago'       => 'nullable',
        ]);

        $instructorModel = Instructor::where('user_id', $validated['instructor_id'])->firstOrFail();

        $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
        $fechaFin    = Carbon::parse($validated['fecha_fin'])->endOfDay();

        $clasesLiquidables = Clase::where('instructor_id', $validated['instructor_id']) // users.id
            ->where('estado', 'finalizada')
            ->whereBetween('fecha_hora_inicio', [$fechaInicio, $fechaFin])
            ->withCount('asistencias')
            ->get();

        if ($clasesLiquidables->isEmpty()) {
            return back()->withErrors([
                'liquidacion' => 'No hay clases finalizadas para liquidar en ese período.',
            ]);
        }

        $tarifaPorClase = (float) ($instructorModel->tarifa_por_clase ?? 0);
        $tarifaPorAsistente = (float) ($instructorModel->tarifa_por_asistente ?? 0);

        $tipoTarifa = $tarifaPorClase > 0 && $tarifaPorAsistente > 0
            ? 'mixta'
            : ($tarifaPorAsistente > 0 ? 'por_asistente' : 'por_clase');

        $totalClases = $clasesLiquidables->count();
        $totalAsistentes = (int) $clasesLiquidables->sum('asistencias_count');
        $totalPago = (float) $clasesLiquidables->sum(function ($clase) use ($tarifaPorClase, $tarifaPorAsistente) {
            return ($tarifaPorClase > 0 ? $tarifaPorClase : 0)
                + ($tarifaPorAsistente > 0 ? ((int) $clase->asistencias_count * $tarifaPorAsistente) : 0);
        });

        $tarifaAplicada = $tipoTarifa === 'por_asistente' ? $tarifaPorAsistente : $tarifaPorClase;

        DB::transaction(function () use (
            $validated,
            $instructorModel,
            $clasesLiquidables,
            $totalClases,
            $totalAsistentes,
            $tipoTarifa,
            $tarifaAplicada,
            $totalPago
        ) {
            Liquidacion::create([
                'instructor_id'    => $instructorModel->id,
                'aprobado_por'     => Auth::id(),
                'fecha_inicio'     => $validated['fecha_inicio'],
                'fecha_fin'        => $validated['fecha_fin'],
                'total_clases'     => $totalClases,
                'total_asistentes' => $totalAsistentes,
                'tipo_tarifa'      => $tipoTarifa,
                'tarifa_aplicada'  => $tarifaAplicada,
                'total_pago'       => $totalPago,
                'fecha_pago'       => $validated['fecha_pago'],
                'notas'            => $validated['notas'] ?? null,
            ]);

            Clase::whereIn('id', $clasesLiquidables->pluck('id'))->delete();
        });

        return redirect()
            ->route('admin.reportes.liquidacion', [
                'instructor_id' => $validated['instructor_id'],
                'fecha_inicio'  => $validated['fecha_inicio'],
                'fecha_fin'     => $validated['fecha_fin'],
            ])
            ->with('success', '✅ Pago registrado. Se liquidaron y eliminaron las clases finalizadas del período.');
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

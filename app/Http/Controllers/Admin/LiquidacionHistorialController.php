<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Liquidacion;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * Registrar un nuevo pago de liquidación.
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

        // instructor_id en el JSX es el user_id — buscar el registro en instructores
        $instructor = Instructor::where('user_id', $validated['instructor_id'])->firstOrFail();

        Liquidacion::create([
            'instructor_id'    => $instructor->id,
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

        return redirect()
            ->route('admin.reportes.liquidacion.historial')
            ->with('success', 'Pago registrado correctamente.');
    }

    /**
     * Eliminar una liquidación del historial.
     */
    public function destroy(Liquidacion $liquidacion)
    {
        $liquidacion->delete();

        return back()->with('success', 'Liquidación eliminada.');
    }
}

<?php
// Ruta: app/Http/Controllers/Admin/LiquidacionHistorialController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Liquidacion;
use App\Models\Instructor;
use App\Models\Clase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiquidacionHistorialController extends Controller
{
    // ── Historial completo ────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $instructores = Instructor::with('user')->where('activo', true)->get()
            ->map(fn($i) => ['id' => $i->id, 'name' => $i->user?->name ?? '—']);

        $query = Liquidacion::with(['instructor.user', 'aprobadoPor'])
            ->orderByDesc('fecha_pago');

        if ($request->instructor_id) {
            $query->where('instructor_id', $request->instructor_id);
        }
        if ($request->fecha_inicio) {
            $query->where('fecha_inicio', '>=', $request->fecha_inicio);
        }
        if ($request->fecha_fin) {
            $query->where('fecha_fin', '<=', $request->fecha_fin);
        }

        $liquidaciones = $query->get()->map(fn($l) => [
            'id'               => $l->id,
            'instructor'       => $l->instructor?->user?->name ?? '—',
            'fecha_inicio'     => $l->fecha_inicio->format('d/m/Y'),
            'fecha_fin'        => $l->fecha_fin->format('d/m/Y'),
            'total_clases'     => $l->total_clases,
            'total_asistentes' => $l->total_asistentes,
            'tipo_tarifa'      => $l->tipo_tarifa,
            'tarifa_aplicada'  => $l->tarifa_aplicada,
            'total_pago'       => $l->total_pago,
            'fecha_pago'       => $l->fecha_pago->format('d/m/Y'),
            'aprobado_por'     => $l->aprobadoPor?->name ?? '—',
            'notas'            => $l->notas,
        ]);

        $totalPagado = $liquidaciones->sum('total_pago');

        return Inertia::render('Admin/Reportes/LiquidacionHistorial', [
            'liquidaciones' => $liquidaciones,
            'instructores'  => $instructores,
            'totalPagado'   => $totalPagado,
            'filters'       => $request->only(['instructor_id', 'fecha_inicio', 'fecha_fin']),
        ]);
    }

    // ── Registrar pago (desde página Liquidacion) ─────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'instructor_id'    => 'required|exists:instructores,id',
            'fecha_inicio'     => 'required|date',
            'fecha_fin'        => 'required|date|after_or_equal:fecha_inicio',
            'total_clases'     => 'required|integer|min:0',
            'total_asistentes' => 'required|integer|min:0',
            'tipo_tarifa'      => 'required|in:por_clase,por_asistente',
            'tarifa_aplicada'  => 'required|numeric|min:0',
            'total_pago'       => 'required|numeric|min:0',
            'fecha_pago'       => 'required|date',
            'notas'            => 'nullable|string|max:500',
        ]);

        Liquidacion::create([
            'instructor_id'    => $request->instructor_id,
            'aprobado_por'     => auth()->id(),
            'fecha_inicio'     => $request->fecha_inicio,
            'fecha_fin'        => $request->fecha_fin,
            'total_clases'     => $request->total_clases,
            'total_asistentes' => $request->total_asistentes,
            'tipo_tarifa'      => $request->tipo_tarifa,
            'tarifa_aplicada'  => $request->tarifa_aplicada,
            'total_pago'       => $request->total_pago,
            'fecha_pago'       => $request->fecha_pago,
            'notas'            => $request->notas,
        ]);

        return redirect()->route('admin.reportes.liquidacion.historial')
            ->with('success', 'Liquidación registrada correctamente.');
    }

    // ── Eliminar registro ─────────────────────────────────────────────────────
    public function destroy(Liquidacion $liquidacion)
    {
        $liquidacion->delete();
        return back()->with('success', 'Registro eliminado.');
    }
}

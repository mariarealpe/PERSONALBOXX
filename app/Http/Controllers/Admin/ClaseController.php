<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\TipoClase;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ClaseController extends Controller
{
    public function index(Request $request)
    {
        $fecha         = $request->input('fecha', now()->format('Y-m-d'));
        $vista         = $request->input('vista', 'semana');
        $tipo_clase_id = $request->input('tipo_clase_id');
        $instructor_id = $request->input('instructor_id');

        if ($vista === 'dia') {
            $inicio = Carbon::parse($fecha)->startOfDay();
            $fin    = Carbon::parse($fecha)->endOfDay();
        } elseif ($vista === 'mes') {
            $inicio = Carbon::parse($fecha)->startOfMonth();
            $fin    = Carbon::parse($fecha)->endOfMonth();
        } else {
            $inicio = Carbon::parse($fecha)->startOfWeek(Carbon::MONDAY);
            $fin    = Carbon::parse($fecha)->endOfWeek(Carbon::SUNDAY);
        }

        $query = Clase::with(['tipoClase', 'instructor', 'reservasConfirmadas'])
            ->whereBetween('fecha_hora_inicio', [$inicio, $fin]);

        if ($tipo_clase_id) {
            $query->where('tipo_clase_id', $tipo_clase_id);
        }
        if ($instructor_id) {
            $query->where('instructor_id', $instructor_id);
        }

        $clases = $query->orderBy('fecha_hora_inicio')->get();

        $tiposClase   = TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'color']);
        // Solo traemos id y name — sin with('instructor') para evitar el error
        $instructores = User::role('instructor')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Clases/Index', [
            'clases'       => $clases,
            'tiposClase'   => $tiposClase,
            'instructores' => $instructores,
            'filters'      => [
                'fecha'         => $fecha,
                'vista'         => $vista,
                'tipo_clase_id' => $tipo_clase_id,
                'instructor_id' => $instructor_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_clase_id'     => 'required|exists:tipos_clase,id',
            'instructor_id'     => 'required|exists:users,id',
            'fecha_hora_inicio' => 'required|date',
            'fecha_hora_fin'    => 'required|date|after:fecha_hora_inicio',
            'capacidad_maxima'  => 'required|integer|min:1',
            'sala'              => 'nullable|string|max:100',
            'estado'            => 'nullable|in:programada,en_curso,finalizada,cancelada',
        ], [
            'tipo_clase_id.required'     => 'El tipo de clase es obligatorio',
            'instructor_id.required'     => 'El instructor es obligatorio',
            'fecha_hora_inicio.required' => 'La fecha y hora de inicio son obligatorias',
            'fecha_hora_fin.required'    => 'La fecha y hora de fin son obligatorias',
            'fecha_hora_fin.after'       => 'La hora de fin debe ser posterior a la de inicio',
            'capacidad_maxima.required'  => 'La capacidad máxima es obligatoria',
            'capacidad_maxima.min'       => 'La capacidad debe ser al menos 1',
        ]);

        // Verificar solapamiento en la misma sala
        if (!empty($validated['sala'])) {
            $solapamiento = Clase::where('sala', $validated['sala'])
                ->where('estado', '!=', 'cancelada')
                ->where(function ($q) use ($validated) {
                    $q->whereBetween('fecha_hora_inicio', [$validated['fecha_hora_inicio'], $validated['fecha_hora_fin']])
                        ->orWhereBetween('fecha_hora_fin', [$validated['fecha_hora_inicio'], $validated['fecha_hora_fin']])
                        ->orWhere(function ($q2) use ($validated) {
                            $q2->where('fecha_hora_inicio', '<=', $validated['fecha_hora_inicio'])
                                ->where('fecha_hora_fin', '>=', $validated['fecha_hora_fin']);
                        });
                })->exists();

            if ($solapamiento) {
                return back()->withErrors(['sala' => 'Ya existe una clase programada en esa sala en ese horario.']);
            }
        }

        $validated['horario_clase_id'] = null;
        $validated['estado']           = $validated['estado'] ?? 'programada';

        Clase::create($validated);

        return redirect()->back()->with('success', '¡Clase creada exitosamente!');
    }

    public function update(Request $request, Clase $clase)
    {
        $validated = $request->validate([
            'tipo_clase_id'     => 'required|exists:tipos_clase,id',
            'instructor_id'     => 'required|exists:users,id',
            'fecha_hora_inicio' => 'required|date',
            'fecha_hora_fin'    => 'required|date|after:fecha_hora_inicio',
            'capacidad_maxima'  => 'required|integer|min:1',
            'sala'              => 'nullable|string|max:100',
            'estado'            => 'nullable|in:programada,en_curso,finalizada,cancelada',
        ]);

        // No reducir capacidad por debajo de reservas actuales
        $totalReservas = $clase->reservasConfirmadas()->count();
        if ($validated['capacidad_maxima'] < $totalReservas) {
            return back()->withErrors([
                'capacidad_maxima' => "No puedes reducir la capacidad por debajo de las reservas actuales ({$totalReservas})."
            ]);
        }

        $clase->update($validated);

        return redirect()->back()->with('success', '¡Clase actualizada exitosamente!');
    }

    public function destroy(Clase $clase)
    {
        // Cancelar todas las reservas asociadas
        if ($clase->reservasConfirmadas()->count() > 0) {
            $clase->reservas()->update([
                'estado'             => 'cancelada',
                'fecha_cancelacion'  => now(),
            ]);
        }

        $clase->update(['estado' => 'cancelada']);
        $clase->delete();

        return redirect()->back()->with('success', '¡Clase eliminada exitosamente!');
    }

    public function toggleEstado(Request $request, Clase $clase)
    {
        $request->validate([
            'estado' => 'required|in:programada,en_curso,finalizada,cancelada',
        ]);

        $clase->update(['estado' => $request->estado]);

        return redirect()->back()->with('success', '¡Estado de la clase actualizado!');
    }
}

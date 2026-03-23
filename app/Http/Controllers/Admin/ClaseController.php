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

        $query = Clase::with(['tipoClase', 'instructor', 'reservasConfirmadas']);

        // CAMBIO: si vista es 'todas' no aplica filtro de fecha
        if ($vista !== 'todas') {
            if ($vista === 'dia') {
                $inicio = Carbon::parse($fecha)->startOfDay();
                $fin    = Carbon::parse($fecha)->endOfDay();
            } elseif ($vista === 'mes') {
                $inicio = Carbon::parse($fecha)->startOfMonth();
                $fin    = Carbon::parse($fecha)->endOfMonth();
            } else {
                // semana por defecto
                $inicio = Carbon::parse($fecha)->startOfWeek(Carbon::MONDAY);
                $fin    = Carbon::parse($fecha)->endOfWeek(Carbon::SUNDAY);
            }
            $query->whereBetween('fecha_hora_inicio', [$inicio, $fin]);
        }

        if ($tipo_clase_id) {
            $query->where('tipo_clase_id', $tipo_clase_id);
        }
        if ($instructor_id) {
            $query->where('instructor_id', $instructor_id);
        }

        $clases = $query->orderBy('fecha_hora_inicio', 'desc')->get();

        $tiposClase   = TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'color']);
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

        Clase::create([
            'horario_clase_id'  => null,
            'tipo_clase_id'     => $validated['tipo_clase_id'],
            'instructor_id'     => $validated['instructor_id'],
            'fecha_hora_inicio' => $validated['fecha_hora_inicio'],
            'fecha_hora_fin'    => $validated['fecha_hora_fin'],
            'capacidad_maxima'  => $validated['capacidad_maxima'],
            'sala'              => $validated['sala'] ?? null,
            'estado'            => $validated['estado'] ?? 'programada',
        ]);

        return redirect()->back()->with('success', '¡Clase creada exitosamente!');
    }

    public function update(Request $request, Clase $clase)
    {
        // Clases finalizadas no se pueden editar
        if ($clase->estado === 'finalizada') {
            return back()->withErrors(['estado' => 'Las clases finalizadas no se pueden editar.']);
        }

        $validated = $request->validate([
            'tipo_clase_id'     => 'required|exists:tipos_clase,id',
            'instructor_id'     => 'required|exists:users,id',
            'fecha_hora_inicio' => 'required|date',
            'fecha_hora_fin'    => 'required|date|after:fecha_hora_inicio',
            'capacidad_maxima'  => 'required|integer|min:1',
            'sala'              => 'nullable|string|max:100',
            'estado'            => 'nullable|in:programada,en_curso,finalizada,cancelada',
        ]);

        $totalReservas = $clase->reservasConfirmadas()->count();
        if ($validated['capacidad_maxima'] < $totalReservas) {
            return back()->withErrors([
                'capacidad_maxima' => "No puedes reducir la capacidad por debajo de las reservas actuales ({$totalReservas})."
            ]);
        }

        $clase->update([
            'tipo_clase_id'     => $validated['tipo_clase_id'],
            'instructor_id'     => $validated['instructor_id'],
            'fecha_hora_inicio' => $validated['fecha_hora_inicio'],
            'fecha_hora_fin'    => $validated['fecha_hora_fin'],
            'capacidad_maxima'  => $validated['capacidad_maxima'],
            'sala'              => $validated['sala'] ?? null,
            'estado'            => $validated['estado'] ?? $clase->estado,
        ]);

        return redirect()->back()->with('success', '¡Clase actualizada exitosamente!');
    }

    public function destroy(Clase $clase)
    {
        if ($clase->reservasConfirmadas()->count() > 0) {
            $clase->reservas()->update([
                'estado'            => 'cancelada',
                'fecha_cancelacion' => now(),
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

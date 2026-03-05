<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\Asistencia;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $clase_id = $request->input('clase_id');
        $fecha    = $request->input('fecha', now()->format('Y-m-d'));

        $clasesHoy = Clase::with(['tipoClase', 'instructor'])
            ->whereDate('fecha_hora_inicio', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora_inicio')
            ->get();

        $claseSeleccionada = null;
        $inscritos         = collect();
        $asistentes        = collect();

        if ($clase_id) {
            $claseSeleccionada = Clase::with(['tipoClase', 'instructor'])->find($clase_id);

            if ($claseSeleccionada) {
                $inscritos = Reserva::where('clase_id', $clase_id)
                    ->where('estado', 'confirmada')
                    ->with('cliente')
                    ->get();

                $asistentes = Asistencia::where('clase_id', $clase_id)
                    ->with(['cliente', 'registradoPor'])
                    ->get();
            }
        }

        $clientes = User::role('cliente')->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Asistencias/Index', [
            'clasesHoy'         => $clasesHoy,
            'claseSeleccionada' => $claseSeleccionada,
            'inscritos'         => $inscritos,
            'asistentes'        => $asistentes,
            'clientes'          => $clientes,
            'filters'           => ['clase_id' => $clase_id, 'fecha' => $fecha],
        ]);
    }

    public function registrar(Request $request)
    {
        $validated = $request->validate([
            'clase_id'   => 'required|exists:clases,id',
            'cliente_id' => 'required|exists:users,id',
        ], [
            'clase_id.required'   => 'La clase es obligatoria',
            'cliente_id.required' => 'El cliente es obligatorio',
        ]);

        $clase = Clase::find($validated['clase_id']);

        // Verificar aforo
        $totalAsistentes = Asistencia::where('clase_id', $validated['clase_id'])->count();
        if ($totalAsistentes >= $clase->capacidad_maxima) {
            return back()->withErrors(['cliente_id' => 'La clase ya alcanzó el aforo máximo.']);
        }

        // Verificar si ya está registrado
        $yaRegistrado = Asistencia::where('clase_id', $validated['clase_id'])
            ->where('cliente_id', $validated['cliente_id'])
            ->exists();

        if ($yaRegistrado) {
            return back()->withErrors(['cliente_id' => 'Este cliente ya tiene asistencia registrada.']);
        }

        $tienReserva = Reserva::where('clase_id', $validated['clase_id'])
            ->where('cliente_id', $validated['cliente_id'])
            ->where('estado', 'confirmada')
            ->exists();

        Asistencia::create([
            'clase_id'       => $validated['clase_id'],
            'cliente_id'     => $validated['cliente_id'],
            'tenia_reserva'  => $tienReserva,
            'hora_registro'  => now(),
            'registrado_por' => auth()->id(),
        ]);

        return redirect()->back()->with('success', '¡Asistencia registrada exitosamente!');
    }

    public function eliminar(Asistencia $asistencia)
    {
        $asistencia->delete();
        return redirect()->back()->with('success', '¡Asistencia eliminada!');
    }
}

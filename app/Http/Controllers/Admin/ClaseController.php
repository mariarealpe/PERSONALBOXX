<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ClaseCanceladaMail;
use App\Mail\ClaseModificadaMail;
use App\Mail\CupoDisponibleMail;
use App\Models\Clase;
use App\Models\Reserva;
use App\Models\TipoClase;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ClaseController extends Controller
{
    public function index(Request $request)
    {
        $fecha         = $request->input('fecha', now()->format('Y-m-d'));
        $vista         = $request->input('vista', 'semana');
        $tipo_clase_id = $request->input('tipo_clase_id');
        $instructor_id = $request->input('instructor_id');

        $query = Clase::with(['tipoClase', 'instructor', 'reservasConfirmadas']);

        if ($vista !== 'todas') {
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
            $query->whereBetween('fecha_hora_inicio', [$inicio, $fin]);
        }

        if ($tipo_clase_id) $query->where('tipo_clase_id', $tipo_clase_id);
        if ($instructor_id) $query->where('instructor_id', $instructor_id);

        $clases       = $query->orderBy('fecha_hora_inicio', 'desc')->get();
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

    // ── Detalle de clase con listado completo de reservas ─────────────────
    public function show(Clase $clase)
    {
        $clase->load(['tipoClase', 'instructor']);

        // Reservas agrupadas por estado
        $reservas = Reserva::where('clase_id', $clase->id)
            ->with('cliente:id,name,email,foto')
            ->orderByRaw("FIELD(estado, 'confirmada', 'en_espera', 'cancelada', 'completada')")
            ->orderBy('posicion_espera')
            ->orderBy('fecha_reserva')
            ->get()
            ->map(function ($r) {
                return [
                    'id'               => $r->id,
                    'estado'           => $r->estado,
                    'posicion_espera'  => $r->posicion_espera,
                    'fecha_reserva'    => $r->fecha_reserva,
                    'fecha_cancelacion'=> $r->fecha_cancelacion,
                    'notificado_cupo_at' => $r->notificado_cupo_at,
                    'cliente' => $r->cliente ? [
                        'id'    => $r->cliente->id,
                        'name'  => $r->cliente->name,
                        'email' => $r->cliente->email,
                    ] : null,
                ];
            });

        // Conteos por estado
        $resumen = [
            'confirmadas' => $reservas->where('estado', 'confirmada')->count(),
            'en_espera'   => $reservas->where('estado', 'en_espera')->count(),
            'canceladas'  => $reservas->where('estado', 'cancelada')->count(),
            'completadas' => $reservas->where('estado', 'completada')->count(),
            'capacidad'   => $clase->capacidad_maxima,
            'cupos_libres'=> $clase->capacidad_maxima - $reservas->where('estado', 'confirmada')->count(),
        ];

        return Inertia::render('Admin/Clases/Show', [
            'clase'   => $clase,
            'reservas'=> $reservas->values(),
            'resumen' => $resumen,
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

        // ── Guardar capacidad anterior ANTES de actualizar ─────────────────
        $capacidadAnterior = $clase->capacidad_maxima;

        // ── RF-02: Detectar cambios significativos ─────────────────────────
        $cambios = [];

        if ($clase->fecha_hora_inicio->format('Y-m-d H:i') !== Carbon::parse($validated['fecha_hora_inicio'])->format('Y-m-d H:i')) {
            $cambios['Fecha y hora de inicio'] = [
                'anterior' => $clase->fecha_hora_inicio->locale('es')->isoFormat('ddd D/MMM HH:mm'),
                'nuevo'    => Carbon::parse($validated['fecha_hora_inicio'])->locale('es')->isoFormat('ddd D/MMM HH:mm'),
            ];
        }
        if ($clase->fecha_hora_fin->format('Y-m-d H:i') !== Carbon::parse($validated['fecha_hora_fin'])->format('Y-m-d H:i')) {
            $cambios['Hora de fin'] = [
                'anterior' => $clase->fecha_hora_fin->format('H:i'),
                'nuevo'    => Carbon::parse($validated['fecha_hora_fin'])->format('H:i'),
            ];
        }
        if ((int)$clase->instructor_id !== (int)$validated['instructor_id']) {
            $cambios['Instructor'] = [
                'anterior' => User::find($clase->instructor_id)?->name ?? '—',
                'nuevo'    => User::find($validated['instructor_id'])?->name ?? '—',
            ];
        }
        if ($clase->sala !== ($validated['sala'] ?? null)) {
            $cambios['Sala'] = [
                'anterior' => $clase->sala ?? 'Sin sala',
                'nuevo'    => $validated['sala'] ?? 'Sin sala',
            ];
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

        // ── RF-02: Notificar si hubo cambios ───────────────────────────────
        if (!empty($cambios)) {
            $clase->load('tipoClase', 'instructor');
            $clientesConReserva = $clase->reservasConfirmadas()
                ->with('cliente')
                ->get()
                ->pluck('cliente')
                ->filter();

            foreach ($clientesConReserva as $cliente) {
                try {
                    Mail::to($cliente->email)->send(new ClaseModificadaMail($clase, $cambios));
                } catch (\Throwable $e) {
                    Log::warning("Email clase modificada fallido a {$cliente->email}: " . $e->getMessage());
                }
            }
        }

        // ── RF-08: Si aumentó la capacidad, promover lista de espera ───────
        $nuevaCapacidad = (int) $validated['capacidad_maxima'];
        if ($nuevaCapacidad > $capacidadAnterior) {
            $clase->load('tipoClase', 'instructor');
            $reservasActuales = $clase->reservasConfirmadas()->count();
            $cuposLibres      = $nuevaCapacidad - $reservasActuales;

            for ($i = 0; $i < $cuposLibres; $i++) {
                $promovido = $this->promoverListaEspera($clase);
                if (!$promovido) break;
            }
        }

        return redirect()->back()->with('success', '¡Clase actualizada exitosamente!');
    }

    public function destroy(Clase $clase)
    {
        $clase->load('tipoClase', 'instructor');
        $clientesConReserva = $clase->reservasConfirmadas()
            ->with('cliente')
            ->get()
            ->pluck('cliente')
            ->filter();

        foreach ($clientesConReserva as $cliente) {
            try {
                Mail::to($cliente->email)->send(new ClaseCanceladaMail($clase));
            } catch (\Throwable $e) {
                Log::warning("Email clase cancelada fallido a {$cliente->email}: " . $e->getMessage());
            }
        }

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

    private function promoverListaEspera(Clase $clase): bool
    {
        $siguienteEnEspera = Reserva::where('clase_id', $clase->id)
            ->where('estado', 'en_espera')
            ->orderBy('posicion_espera')
            ->with('cliente')
            ->first();

        if (!$siguienteEnEspera) return false;

        $posicionPromovida = $siguienteEnEspera->posicion_espera;

        $siguienteEnEspera->update([
            'estado'             => 'confirmada',
            'posicion_espera'    => null,
            'notificado_cupo_at' => now(),
        ]);

        Reserva::where('clase_id', $clase->id)
            ->where('estado', 'en_espera')
            ->where('posicion_espera', '>', $posicionPromovida)
            ->decrement('posicion_espera');

        if ($siguienteEnEspera->cliente) {
            try {
                Mail::to($siguienteEnEspera->cliente->email)->send(
                    new CupoDisponibleMail($siguienteEnEspera->cliente, $clase)
                );
            } catch (\Throwable $e) {
                Log::warning("Email cupo disponible fallido a {$siguienteEnEspera->cliente->email}: " . $e->getMessage());
            }
        }

        return true;
    }
}

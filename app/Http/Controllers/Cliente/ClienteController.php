<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Clase;
use App\Models\ClientePlan;
use App\Models\Reserva;
use App\Mail\CupoDisponibleMail;
use App\Mail\ReservaConfirmadaMail;   // ── RF-05 ──
use App\Mail\ReservaCanceladaMail;    // ── RF-06 ──
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ClienteController extends Controller
{
    const HORAS_MIN_CANCELACION = 1;

    private function userData($user): array
    {
        return $user->only(['id', 'name', 'email']) + ['foto_url' => $user->foto_url];
    }

    private function planVigente($user): ?ClientePlan
    {
        return ClientePlan::with('plan')
            ->where('cliente_id', $user->id)
            ->where('estado', 'activo')
            ->whereDate('fecha_inicio', '<=', Carbon::today())
            ->whereDate('fecha_vencimiento', '>=', Carbon::today())
            ->latest('fecha_vencimiento')
            ->first();
    }

    public function dashboard(Request $request)
    {
        $user = $request->user()->load('roles');

        $planActivo = ClientePlan::with('plan')
            ->where('cliente_id', $user->id)
            ->where('estado', 'activo')
            ->latest()->first();

        $reservasActivas = Reserva::where('cliente_id', $user->id)
            ->where('estado', 'confirmada')
            ->whereHas('clase', fn($q) => $q->whereIn('estado', ['programada', 'en_curso'])->where('fecha_hora_inicio', '>=', now()))
            ->count();

        $clasesTomadas = Asistencia::where('cliente_id', $user->id)->count();

        $proximasClases = Reserva::with(['clase.tipoClase', 'clase.instructor'])
            ->where('reservas.cliente_id', $user->id)
            ->where('reservas.estado', 'confirmada')
            ->whereHas('clase', fn($q) => $q->whereIn('estado', ['programada', 'en_curso'])->where('fecha_hora_inicio', '>=', now()))
            ->join('clases', 'reservas.clase_id', '=', 'clases.id')
            ->orderBy('clases.fecha_hora_inicio')
            ->select('reservas.*')
            ->take(5)->get();

        return Inertia::render('Cliente/Dashboard', [
            'user'           => $this->userData($user),
            'proximasClases' => $proximasClases,
            'stats'          => [
                'reservas_activas' => $reservasActivas,
                'clases_tomadas'   => $clasesTomadas,
                'plan_actual'      => $planActivo ? [
                    'nombre'            => $planActivo->plan->nombre,
                    'fecha_vencimiento' => $planActivo->fecha_vencimiento,
                    'dias_restantes'    => Carbon::now()->diffInDays($planActivo->fecha_vencimiento, false),
                    'estado'            => $planActivo->estado,
                ] : null,
            ],
        ]);
    }

    public function clases(Request $request)
    {
        $user = $request->user();

        $disponibilidad = $request->input('disponibilidad', '');

        $clases = Clase::with(['tipoClase', 'instructor', 'reservasConfirmadas'])
            ->whereIn('estado', ['programada', 'en_curso'])
            ->where(function ($q) {
                $q->where(function ($qq) {
                    $qq->where('estado', 'programada')
                       ->where('fecha_hora_inicio', '>=', now());
                })->orWhere(function ($qq) {
                    $qq->where('estado', 'en_curso')
                       ->where('fecha_hora_fin', '>=', now());
                });
            })
            ->when($request->fecha,         fn($q, $f) => $q->whereDate('fecha_hora_inicio', $f))
            ->when($request->tipo_clase_id, fn($q, $t) => $q->where('tipo_clase_id', $t))
            ->orderBy('fecha_hora_inicio')
            ->get()
            ->map(function ($clase) use ($user) {
                // ✅ Solo contar reservas CONFIRMADAS (no canceladas)
                $totalReservas    = $clase->reservasConfirmadas()->count();
                $cuposDisponibles = $clase->capacidad_maxima - $totalReservas;

                $pctOcupacion = $clase->capacidad_maxima > 0
                    ? round(($totalReservas / $clase->capacidad_maxima) * 100)
                    : 0;

                if ($cuposDisponibles <= 0) {
                    $estadoDisponibilidad = 'llena';
                } elseif ($cuposDisponibles <= 3) {
                    $estadoDisponibilidad = 'pocos';
                } else {
                    $estadoDisponibilidad = 'disponible';
                }

                // ✅ Solo buscar reservas ACTIVAS (confirmada o en_espera), NO canceladas
                $reservaActiva = Reserva::where('clase_id', $clase->id)
                    ->where('cliente_id', $user->id)
                    ->whereIn('estado', ['confirmada', 'en_espera'])
                    ->first();

                $clase->total_reservas        = $totalReservas;
                $clase->cupos_disponibles     = max(0, $cuposDisponibles);
                $clase->pct_ocupacion         = $pctOcupacion;
                $clase->estado_disponibilidad = $estadoDisponibilidad;
                $clase->ya_reservo            = $reservaActiva && $reservaActiva->estado === 'confirmada';
                $clase->en_espera             = $reservaActiva && $reservaActiva->estado === 'en_espera';
                $clase->posicion_espera       = $reservaActiva?->posicion_espera;
                $clase->total_espera          = Reserva::where('clase_id', $clase->id)
                    ->where('estado', 'en_espera')
                    ->count();

                return $clase;
            })
            ->when($disponibilidad, fn($col) => $col->filter(
                fn($c) => $c->estado_disponibilidad === $disponibilidad
            ))
            ->values();

        $perPage   = 12;
        $page      = (int) $request->input('page', 1);
        $total     = $clases->count();
        $items     = $clases->forPage($page, $perPage);

        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $items, $total, $perPage, $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $tiposClase = \App\Models\TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'color']);

        return Inertia::render('Cliente/Clases', [
            'user'       => $this->userData($user),
            'clases'     => $paginated,
            'tiposClase' => $tiposClase,
            'filters'    => $request->only(['fecha', 'tipo_clase_id', 'disponibilidad']),
        ]);
    }

    public function reservar(Request $request)
    {
        $request->validate(['clase_id' => 'required|exists:clases,id']);

        $user = $request->user();
        $claseId = $request->clase_id;

        // ✅ Verificar si tiene plan vigente PRIMERO
        $planVigente = ClientePlan::where('cliente_id', $user->id)
            ->where('estado', 'activo')
            ->whereDate('fecha_inicio', '<=', now())
            ->whereDate('fecha_vencimiento', '>=', now())
            ->exists();

        if (!$planVigente) {
            return back()->withErrors([
                'plan' => '❌ Tu plan está vencido o no tienes uno activo. Debes renovarlo en el punto físico.',
            ])->withInput();
        }

        // ✅ Verificar si ya tiene reserva CONFIRMADA o EN ESPERA
        $reservaActiva = Reserva::where('cliente_id', $user->id)
            ->where('clase_id', $claseId)
            ->whereIn('estado', ['confirmada', 'en_espera'])
            ->first();

        if ($reservaActiva) {
            return back()->withErrors([
                'reserva' => '⚠️ Ya tienes una reserva en esta clase.',
            ])->withInput();
        }

        $clase = Clase::with('tipoClase', 'instructor')->findOrFail($claseId);

        // ✅ Validar estado de la clase
        if (!in_array($clase->estado, ['programada', 'en_curso'])) {
            return back()->withErrors([
                'clase' => '❌ Esta clase no está disponible.',
            ])->withInput();
        }

        // ✅ Validar que no haya pasado
        if ($clase->fecha_hora_inicio < now()) {
            return back()->withErrors([
                'clase' => '❌ Esta clase ya comenzó.',
            ])->withInput();
        }

        $totalConfirmadas = $clase->reservasConfirmadas()->count();

        // ── Si está llena, agregar a lista de espera ──
        if ($totalConfirmadas >= $clase->capacidad_maxima) {
            $ultimaPosicion = Reserva::where('clase_id', $claseId)
                ->where('estado', 'en_espera')
                ->max('posicion_espera') ?? 0;

            // ✅ Buscar si hay una reserva anterior cancelada para actualizar
            $reservaAnterior = Reserva::where('cliente_id', $user->id)
                ->where('clase_id', $claseId)
                ->where('estado', 'cancelada')
                ->first();

            if ($reservaAnterior) {
                $reservaAnterior->update([
                    'estado'          => 'en_espera',
                    'fecha_reserva'   => now(),
                    'posicion_espera' => $ultimaPosicion + 1,
                ]);
            } else {
                Reserva::create([
                    'cliente_id'      => $user->id,
                    'clase_id'        => $claseId,
                    'estado'          => 'en_espera',
                    'fecha_reserva'   => now(),
                    'posicion_espera' => $ultimaPosicion + 1,
                ]);
            }

            return back()->with('success', "📋 La clase está llena. Te agregamos a la lista de espera en la posición #" . ($ultimaPosicion + 1) . ". Te avisaremos si se libera un cupo.");
        }

        // ── Crear reserva confirmada ──
        // ✅ Buscar si hay una reserva anterior cancelada para actualizar
        $reservaAnterior = Reserva::where('cliente_id', $user->id)
            ->where('clase_id', $claseId)
            ->where('estado', 'cancelada')
            ->first();

        if ($reservaAnterior) {
            $reserva = $reservaAnterior;
            $reserva->update([
                'estado'        => 'confirmada',
                'fecha_reserva' => now(),
            ]);
        } else {
            $reserva = Reserva::create([
                'cliente_id'    => $user->id,
                'clase_id'      => $claseId,
                'estado'        => 'confirmada',
                'fecha_reserva' => now(),
            ]);
        }

        try {
            Mail::to($user->email)->send(new ReservaConfirmadaMail($user, $reserva, $clase));
        } catch (\Throwable $e) {
            Log::warning("Email confirmación reserva fallido a {$user->email}: " . $e->getMessage());
        }

        return back()->with('success', '✅ ¡Reserva confirmada! Te enviamos un correo de confirmación.');
    }

    public function reservas(Request $request)
    {
        $user  = $request->user();
        $ahora = now();

        $reservas = Reserva::with(['clase.tipoClase', 'clase.instructor'])
            ->where('reservas.cliente_id', $user->id)
            ->whereHas('clase', fn($q) => $q->where('fecha_hora_inicio', '>', $ahora))
            ->when($request->estado, fn($q, $e) => $q->where('reservas.estado', $e))
            ->join('clases', 'reservas.clase_id', '=', 'clases.id')
            ->select('reservas.*')
            ->orderBy('clases.fecha_hora_inicio', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Cliente/Reservas', [
            'user'                  => $this->userData($user),
            'reservas'              => $reservas,
            'filters'               => $request->only(['estado']),
            'horas_min_cancelacion' => self::HORAS_MIN_CANCELACION,
        ]);
    }

    public function cancelarReserva(Request $request, Reserva $reserva)
    {
        // ✅ Verificar que sea el dueño
        if ($reserva->cliente_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para cancelar esta reserva');
        }

        // ✅ Verificar estado
        if (!in_array($reserva->estado, ['confirmada', 'en_espera'])) {
            return back()->withErrors([
                'cancelar' => '❌ Esta reserva no se puede cancelar.',
            ]);
        }

        // ✅ Verificar que la clase no haya pasado
        if ($reserva->clase->fecha_hora_inicio < now()) {
            return back()->withErrors([
                'cancelar' => '❌ No puedes cancelar una clase que ya comenzó.',
            ]);
        }

        // ✅ Validar límite de cancelación
        $minutosRestantes = now()->diffInMinutes($reserva->clase->fecha_hora_inicio, false);
        $minutosMinimos   = self::HORAS_MIN_CANCELACION * 60;

        if ($minutosRestantes < $minutosMinimos) {
            $horasRestantes = ceil($minutosRestantes / 60);
            return back()->withErrors([
                'cancelar' => "❌ Solo puedes cancelar con al menos " . self::HORAS_MIN_CANCELACION . " hora de anticipación. La clase comienza en {$horasRestantes} hora(s)."
            ]);
        }

        $eraConfirmada = $reserva->estado === 'confirmada';
        $claseId       = $reserva->clase_id;
        $user          = $request->user();
        $clase         = Clase::with('tipoClase', 'instructor')->find($claseId);

        // ── Cancelar ──
        $reserva->update([
            'estado'            => 'cancelada',
            'fecha_cancelacion' => now(),
        ]);

        // ── Promover de lista de espera si era confirmada ──
        if ($eraConfirmada) {
            $this->promoverListaEspera($claseId);
        }

        // ── Email ──
        try {
            Mail::to($user->email)->send(new ReservaCanceladaMail($user, $clase));
        } catch (\Throwable $e) {
            Log::warning("Email cancelación fallido a {$user->email}: " . $e->getMessage());
        }

        return back()->with('success', '✅ Reserva cancelada. Te enviamos un correo de confirmación.');
    }

    private function promoverListaEspera(int $claseId): void
    {
        $siguiente = Reserva::where('clase_id', $claseId)
            ->where('estado', 'en_espera')
            ->orderBy('posicion_espera')
            ->with('cliente')
            ->first();

        if (!$siguiente) return;

        $posicionAnterior = $siguiente->posicion_espera;

        $siguiente->update([
            'estado'             => 'confirmada',
            'posicion_espera'    => null,
            'notificado_cupo_at' => now(),
        ]);

        Reserva::where('clase_id', $claseId)
            ->where('estado', 'en_espera')
            ->where('posicion_espera', '>', $posicionAnterior)
            ->decrement('posicion_espera');

        if ($siguiente->cliente) {
            try {
                $clase = Clase::with('tipoClase', 'instructor')->find($claseId);
                Mail::to($siguiente->cliente->email)->send(
                    new CupoDisponibleMail($siguiente->cliente, $clase)
                );
            } catch (\Throwable $e) {
                Log::warning("Email cupo disponible fallido: " . $e->getMessage());
            }
        }
    }

    public function historial(Request $request)
    {
        $user = $request->user();

        $historial = Asistencia::with(['clase.tipoClase', 'clase.instructor'])
            ->where('cliente_id', $user->id)
            ->when($request->fecha_inicio, fn($q, $f) => $q->whereHas('clase', fn($q2) => $q2->whereDate('fecha_hora_inicio', '>=', $f)))
            ->when($request->fecha_fin,    fn($q, $f) => $q->whereHas('clase', fn($q2) => $q2->whereDate('fecha_hora_inicio', '<=', $f)))
            ->when($request->tipo_clase_id, fn($q, $t) => $q->whereHas('clase', fn($q2) => $q2->where('tipo_clase_id', $t)))
            ->orderBy('hora_registro', 'desc')
            ->paginate(15)->withQueryString();

        $tiposClase = \App\Models\TipoClase::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'color']);

        $totalPorTipo = Asistencia::where('asistencias.cliente_id', $user->id)
            ->join('clases', 'asistencias.clase_id', '=', 'clases.id')
            ->join('tipos_clase', 'clases.tipo_clase_id', '=', 'tipos_clase.id')
            ->selectRaw('tipos_clase.nombre, tipos_clase.color, count(*) as total')
            ->groupBy('tipos_clase.id', 'tipos_clase.nombre', 'tipos_clase.color')
            ->orderByDesc('total')->get();

        return Inertia::render('Cliente/Historial', [
            'user'         => $this->userData($user),
            'historial'    => $historial,
            'tiposClase'   => $tiposClase,
            'totalPorTipo' => $totalPorTipo,
            'totalClases'  => Asistencia::where('cliente_id', $user->id)->count(),
            'filters'      => $request->only(['fecha_inicio', 'fecha_fin', 'tipo_clase_id']),
        ]);
    }

    public function miPlan(Request $request)
    {
        $user = $request->user();

        $planActivo = ClientePlan::with('plan')
            ->where('cliente_id', $user->id)->where('estado', 'activo')->latest()->first();

        $historialPlanes = ClientePlan::with('plan')
            ->where('cliente_id', $user->id)->orderBy('created_at', 'desc')->get()
            ->map(fn($cp) => array_merge($cp->toArray(), [
                'dias_restantes' => Carbon::now()->diffInDays($cp->fecha_vencimiento, false),
            ]));

        return Inertia::render('Cliente/MiPlan', [
            'user'            => $this->userData($user),
            'planActivo'      => $planActivo ? array_merge($planActivo->toArray(), [
                'dias_restantes' => Carbon::now()->diffInDays($planActivo->fecha_vencimiento, false),
            ]) : null,
            'historialPlanes' => $historialPlanes,
        ]);
    }
}

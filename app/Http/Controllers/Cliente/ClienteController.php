<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Clase;
use App\Models\ClientePlan;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClienteController extends Controller
{
    private function userData($user): array
    {
        return $user->only(['id', 'name', 'email']) + ['foto_url' => $user->foto_url];
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
            ->whereHas('clase', fn($q) => $q->whereIn('estado', ['programada','en_curso'])->where('fecha_hora_inicio','>=',now()))
            ->count();

        $clasesTomadas = Asistencia::where('cliente_id', $user->id)->count();

        $proximasClases = Reserva::with(['clase.tipoClase','clase.instructor'])
            ->where('reservas.cliente_id', $user->id)
            ->where('reservas.estado', 'confirmada')
            ->whereHas('clase', fn($q) => $q->whereIn('estado',['programada','en_curso'])->where('fecha_hora_inicio','>=',now()))
            ->join('clases','reservas.clase_id','=','clases.id')
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

        $clases = Clase::with(['tipoClase','instructor','reservasConfirmadas'])
            ->whereIn('estado',['programada','en_curso'])
            ->where('fecha_hora_inicio','>=',now())
            ->when($request->fecha,         fn($q,$f) => $q->whereDate('fecha_hora_inicio',$f))
            ->when($request->tipo_clase_id, fn($q,$t) => $q->where('tipo_clase_id',$t))
            ->orderBy('fecha_hora_inicio')
            ->paginate(12)->withQueryString()
            ->through(function($clase) use ($user) {
                $clase->total_reservas    = $clase->reservasConfirmadas->count();
                $clase->cupos_disponibles = $clase->capacidad_maxima - $clase->total_reservas;
                $clase->ya_reservo        = $clase->reservasConfirmadas->contains('cliente_id', $user->id);
                return $clase;
            });

        $tiposClase = \App\Models\TipoClase::where('activo',true)->orderBy('nombre')->get(['id','nombre','color']);

        return Inertia::render('Cliente/Clases', [
            'user'       => $this->userData($user),
            'clases'     => $clases,
            'tiposClase' => $tiposClase,
            'filters'    => $request->only(['fecha','tipo_clase_id']),
        ]);
    }

    public function reservar(Request $request)
    {
        $request->validate(['clase_id' => 'required|exists:clases,id']);
        $user  = $request->user();
        $clase = Clase::findOrFail($request->clase_id);

        if (!in_array($clase->estado,['programada','en_curso']))
            return back()->withErrors(['reserva' => 'Esta clase no está disponible.']);
        if ($clase->fecha_hora_inicio < now())
            return back()->withErrors(['reserva' => 'Esta clase ya comenzó.']);
        if ($clase->reservasConfirmadas()->count() >= $clase->capacidad_maxima)
            return back()->withErrors(['reserva' => 'No hay cupos disponibles.']);
        if (Reserva::where('cliente_id',$user->id)->where('clase_id',$clase->id)->where('estado','confirmada')->exists())
            return back()->withErrors(['reserva' => 'Ya tienes una reserva en esta clase.']);

        Reserva::create([
            'cliente_id'    => $user->id,
            'clase_id'      => $clase->id,
            'estado'        => 'confirmada',
            'fecha_reserva' => now(),
        ]);

        return back()->with('success','¡Reserva confirmada exitosamente!');
    }

    public function reservas(Request $request)
    {
        $user = $request->user();

        $reservas = Reserva::with(['clase.tipoClase','clase.instructor'])
            ->where('cliente_id', $user->id)
            ->when($request->estado, fn($q,$e) => $q->where('estado',$e))
            ->orderBy('created_at','desc')
            ->paginate(10)->withQueryString();

        return Inertia::render('Cliente/Reservas', [
            'user'     => $this->userData($user),
            'reservas' => $reservas,
            'filters'  => $request->only(['estado']),
        ]);
    }

    public function cancelarReserva(Request $request, Reserva $reserva)
    {
        if ($reserva->cliente_id !== $request->user()->id) abort(403);
        if ($reserva->estado !== 'confirmada')
            return back()->withErrors(['cancelar' => 'Esta reserva no se puede cancelar.']);
        if ($reserva->clase->fecha_hora_inicio < now())
            return back()->withErrors(['cancelar' => 'No puedes cancelar una clase que ya comenzó.']);

        $reserva->update(['estado' => 'cancelada', 'fecha_cancelacion' => now()]);
        return back()->with('success','Reserva cancelada correctamente.');
    }

    public function historial(Request $request)
    {
        $user = $request->user();

        $historial = Asistencia::with(['clase.tipoClase','clase.instructor'])
            ->where('cliente_id', $user->id)
            ->when($request->fecha_inicio, fn($q,$f) => $q->whereHas('clase', fn($q2) => $q2->whereDate('fecha_hora_inicio','>=',$f)))
            ->when($request->fecha_fin,    fn($q,$f) => $q->whereHas('clase', fn($q2) => $q2->whereDate('fecha_hora_inicio','<=',$f)))
            ->when($request->tipo_clase_id,fn($q,$t) => $q->whereHas('clase', fn($q2) => $q2->where('tipo_clase_id',$t)))
            ->orderBy('hora_registro','desc')
            ->paginate(15)->withQueryString();

        $tiposClase = \App\Models\TipoClase::where('activo',true)->orderBy('nombre')->get(['id','nombre','color']);

        $totalPorTipo = Asistencia::where('asistencias.cliente_id', $user->id)
            ->join('clases','asistencias.clase_id','=','clases.id')
            ->join('tipos_clase','clases.tipo_clase_id','=','tipos_clase.id')
            ->selectRaw('tipos_clase.nombre, tipos_clase.color, count(*) as total')
            ->groupBy('tipos_clase.id','tipos_clase.nombre','tipos_clase.color')
            ->orderByDesc('total')->get();

        return Inertia::render('Cliente/Historial', [
            'user'         => $this->userData($user),
            'historial'    => $historial,
            'tiposClase'   => $tiposClase,
            'totalPorTipo' => $totalPorTipo,
            'totalClases'  => Asistencia::where('cliente_id',$user->id)->count(),
            'filters'      => $request->only(['fecha_inicio','fecha_fin','tipo_clase_id']),
        ]);
    }

    public function miPlan(Request $request)
    {
        $user = $request->user();

        $planActivo = ClientePlan::with('plan')
            ->where('cliente_id',$user->id)->where('estado','activo')->latest()->first();

        $historialPlanes = ClientePlan::with('plan')
            ->where('cliente_id',$user->id)->orderBy('created_at','desc')->get()
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

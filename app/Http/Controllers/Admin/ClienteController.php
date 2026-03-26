<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientePlan;
use App\Models\Plan;
use App\Mail\ActivacionCuentaMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $clientes = User::role('cliente')
            ->with([
                'clientePlanes' => function ($q) {
                    $q->where('estado', 'activo')
                        ->with('plan')
                        ->orderBy('fecha_vencimiento', 'desc')
                        ->limit(1);
                }
            ])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($cliente) {
                $planActivo = $cliente->clientePlanes->first();
                $cliente->plan_activo = $planActivo ? [
                    'nombre'            => $planActivo->plan->nombre ?? null,
                    'fecha_vencimiento' => $planActivo->fecha_vencimiento,
                    'estado'            => $planActivo->estado,
                ] : null;
                return $cliente;
            });

        $planes = Plan::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'tipo', 'precio']);

        return Inertia::render('Admin/Clientes/Index', [
            'clientes' => $clientes,
            'planes'   => $planes,
            'filters'  => ['search' => $search],
        ]);
    }

    /**
     * RF-18: Crear cliente — solo email (y nombre opcional).
     * Genera token, envía correo de activación. El cliente crea su propia contraseña.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
        ], [
            'email.required' => 'El correo es obligatorio',
            'email.unique'   => 'Este correo ya está registrado',
        ]);

        // Token seguro con expiración de 24 horas
        $token = Str::uuid()->toString();

        $user = User::create([
            'name'              => $validated['name'] ?? '',
            'email'             => $validated['email'],
            'password'          => Hash::make(Str::random(32)), // temporal — el cliente la cambia al activar
            'email_verified_at' => null,
            'estado_cuenta'     => 'pendiente',
            'token_activacion'  => $token,
            'token_expiracion'  => now()->addHours(24),
            'creado_por'        => auth()->id(),
        ]);

        $user->assignRole('cliente');

        // RF-19: Enviar correo de activación
        try {
            Mail::to($user->email)->send(new ActivacionCuentaMail($user, $token));
        } catch (\Throwable $e) {
            Log::warning("Email de activación fallido para {$user->email}: " . $e->getMessage());
            // No interrumpir el flujo — el admin puede reenviar manualmente
        }

        return redirect()->back()->with('success', "¡Cliente creado! Se envió el correo de activación a {$user->email}.");
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
        ]);

        $data = ['name' => $validated['name'], 'email' => $validated['email']];
        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return redirect()->back()->with('success', '¡Cliente actualizado exitosamente!');
    }

    public function destroy(User $user)
    {
        $user->reservas()->where('estado', 'confirmada')->update(['estado' => 'cancelada', 'fecha_cancelacion' => now()]);
        $user->clientePlanes()->where('estado', 'activo')->update(['estado' => 'cancelado']);
        $user->delete();

        return redirect()->back()->with('success', '¡Cliente eliminado exitosamente!');
    }

    public function asignarPlan(Request $request, User $user)
    {
        $validated = $request->validate([
            'plan_id'           => 'required|exists:planes,id',
            'fecha_inicio'      => 'required|date',
            'fecha_vencimiento' => 'required|date|after:fecha_inicio',
        ], [
            'plan_id.required'           => 'Debes seleccionar un plan',
            'fecha_inicio.required'      => 'La fecha de inicio es obligatoria',
            'fecha_vencimiento.required' => 'La fecha de vencimiento es obligatoria',
            'fecha_vencimiento.after'    => 'La fecha de vencimiento debe ser posterior a la de inicio',
        ]);

        $user->clientePlanes()->where('estado', 'activo')->update(['estado' => 'vencido']);

        ClientePlan::create([
            'cliente_id'           => $user->id,
            'plan_id'              => $validated['plan_id'],
            'fecha_inicio'         => $validated['fecha_inicio'],
            'fecha_vencimiento'    => $validated['fecha_vencimiento'],
            'estado'               => 'activo',
            'clases_usadas_semana' => 0,
        ]);

        return redirect()->back()->with('success', '¡Plan asignado exitosamente!');
    }

    public function show(User $user)
    {
        $user->load([
            'clientePlanes.plan',
            'reservas' => function ($q) {
                $q->with(['clase.tipoClase', 'clase.instructor'])
                    ->orderBy('created_at', 'desc')
                    ->limit(20);
            }
        ]);

        return Inertia::render('Admin/Clientes/Show', [
            'cliente' => $user,
        ]);
    }

    /**
     * RF-24: Reenviar correo de activación — solo para clientes en estado pendiente.
     */
    public function reenviarActivacion(User $user)
    {
        if ($user->estado_cuenta !== 'pendiente') {
            return back()->withErrors(['activacion' => 'Solo se puede reenviar el correo a clientes con cuenta pendiente.']);
        }

        $token = Str::uuid()->toString();

        $user->update([
            'token_activacion' => $token,
            'token_expiracion' => now()->addHours(24),
        ]);

        try {
            Mail::to($user->email)->send(new ActivacionCuentaMail($user, $token));
            return redirect()->back()->with('success', "Correo de activación reenviado a {$user->email}.");
        } catch (\Throwable $e) {
            Log::error("Reenvío de activación fallido para {$user->email}: " . $e->getMessage());
            return redirect()->back()->withErrors(['activacion' => 'No se pudo enviar el correo. Verifica la configuración de mail.']);
        }
    }

    /**
     * RF-24: Activar o desactivar manualmente un cliente.
     */
    public function toggleActivo(User $user)
    {
        $nuevoEstado = $user->estado_cuenta === 'inactivo' ? 'activo' : 'inactivo';
        $user->update(['estado_cuenta' => $nuevoEstado]);

        $msg = $nuevoEstado === 'inactivo' ? "Cliente {$user->name} desactivado." : "Cliente {$user->name} activado.";
        return redirect()->back()->with('success', $msg);
    }
}

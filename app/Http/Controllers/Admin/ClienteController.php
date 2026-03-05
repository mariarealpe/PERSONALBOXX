<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientePlan;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
            ->withQueryString();

        $planes = Plan::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'tipo', 'precio']);

        return Inertia::render('Admin/Clientes/Index', [
            'clientes' => $clientes,
            'planes'   => $planes,
            'filters'  => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:20',
        ], [
            'name.required'     => 'El nombre es obligatorio',
            'email.required'    => 'El correo es obligatorio',
            'email.unique'      => 'Este correo ya está registrado',
            'password.required' => 'La contraseña es obligatoria',
            'password.min'      => 'La contraseña debe tener al menos 8 caracteres',
        ]);

        $user = User::create([
            'name'               => $validated['name'],
            'email'              => $validated['email'],
            'password'           => Hash::make($validated['password']),
            'email_verified_at'  => now(),
        ]);

        $user->assignRole('cliente');

        return redirect()->back()->with('success', '¡Cliente creado exitosamente!');
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
        // Cancelar planes y reservas activas
        $user->reservas()->where('estado', 'confirmada')->update(['estado' => 'cancelada', 'fecha_cancelacion' => now()]);
        $user->clientePlanes()->where('estado', 'activo')->update(['estado' => 'cancelado']);
        $user->delete();

        return redirect()->back()->with('success', '¡Cliente eliminado exitosamente!');
    }

    public function asignarPlan(Request $request, User $user)
    {
        $validated = $request->validate([
            'plan_id'       => 'required|exists:planes,id',
            'fecha_inicio'  => 'required|date',
        ], [
            'plan_id.required'      => 'Debes seleccionar un plan',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria',
        ]);

        // Vencer plan actual si existe
        $user->clientePlanes()->where('estado', 'activo')->update(['estado' => 'vencido']);

        ClientePlan::create([
            'cliente_id'        => $user->id,
            'plan_id'           => $validated['plan_id'],
            'fecha_inicio'      => $validated['fecha_inicio'],
            'fecha_vencimiento' => \Carbon\Carbon::parse($validated['fecha_inicio'])->addDays(30)->format('Y-m-d'),
            'estado'            => 'activo',
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
}

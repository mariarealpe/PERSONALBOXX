<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $planes = Plan::withCount('clientePlanes')
            ->orderBy('precio')
            ->get()
            ->map(fn($p) => [
                'id'                    => $p->id,
                'nombre'                => $p->nombre,
                'tipo'                  => $p->tipo,
                'clases_por_semana'     => $p->clases_por_semana,
                'es_ilimitado'          => $p->es_ilimitado,
                'incluye_personalizadas'=> $p->incluye_personalizadas,
                'precio'                => $p->precio,
                'descripcion'           => $p->descripcion,
                'activo'                => $p->activo,
                'foto_url'              => $p->foto ? Storage::disk('public')->url($p->foto) : null,
                'color_fondo'           => $p->color_fondo ?? '#1a1a2e',
                'beneficios'            => $p->beneficios ?? [],
                'clientes_activos'      => $p->client_planes_count ?? 0,
            ]);

        return Inertia::render('Admin/Planes/Index', [
            'planes' => $planes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'                 => 'required|string|max:255',
            'tipo'                   => 'required|in:adultos_activos,membresia,premium,personalizado',
            'precio'                 => 'required|numeric|min:0',
            'descripcion'            => 'nullable|string',
            'clases_por_semana'      => 'nullable|integer|min:1',
            'es_ilimitado'           => 'boolean',
            'incluye_personalizadas' => 'boolean',
            'activo'                 => 'boolean',
            'foto'                   => 'nullable|image|mimes:jpeg,png,webp|max:3072',
            'color_fondo'            => 'nullable|string|max:7',
            'beneficios'             => 'nullable|string', // JSON string desde el form
        ], [
            'nombre.required'   => 'El nombre del plan es obligatorio',
            'tipo.required'     => 'El tipo de plan es obligatorio',
            'precio.required'   => 'El precio es obligatorio',
            'foto.image'        => 'El archivo debe ser una imagen',
            'foto.max'          => 'La imagen no debe superar 3MB',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('planes', 'public');
        }

        $beneficios = [];
        if (!empty($validated['beneficios'])) {
            $decoded = json_decode($validated['beneficios'], true);
            $beneficios = is_array($decoded) ? $decoded : [];
        }

        Plan::create([
            'nombre'                 => $validated['nombre'],
            'tipo'                   => $validated['tipo'],
            'precio'                 => $validated['precio'],
            'descripcion'            => $validated['descripcion'] ?? null,
            'clases_por_semana'      => $validated['es_ilimitado'] ? null : ($validated['clases_por_semana'] ?? null),
            'es_ilimitado'           => $validated['es_ilimitado'] ?? false,
            'incluye_personalizadas' => $validated['incluye_personalizadas'] ?? false,
            'activo'                 => $validated['activo'] ?? true,
            'foto'                   => $fotoPath,
            'color_fondo'            => $validated['color_fondo'] ?? '#1a1a2e',
            'beneficios'             => $beneficios,
        ]);

        return redirect()->back()->with('success', '¡Plan creado exitosamente!');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'nombre'                 => 'required|string|max:255',
            'tipo'                   => 'required|in:adultos_activos,membresia,premium,personalizado',
            'precio'                 => 'required|numeric|min:0',
            'descripcion'            => 'nullable|string',
            'clases_por_semana'      => 'nullable|integer|min:1',
            'es_ilimitado'           => 'boolean',
            'incluye_personalizadas' => 'boolean',
            'activo'                 => 'boolean',
            'foto'                   => 'nullable|image|mimes:jpeg,png,webp|max:3072',
            'eliminar_foto'          => 'nullable|boolean',
            'color_fondo'            => 'nullable|string|max:7',
            'beneficios'             => 'nullable|string',
        ]);

        // Manejar foto
        $fotoPath = $plan->foto;

        if ($request->boolean('eliminar_foto') && $fotoPath) {
            Storage::disk('public')->delete($fotoPath);
            $fotoPath = null;
        }

        if ($request->hasFile('foto')) {
            if ($fotoPath) {
                Storage::disk('public')->delete($fotoPath);
            }
            $fotoPath = $request->file('foto')->store('planes', 'public');
        }

        $beneficios = $plan->beneficios ?? [];
        if (isset($validated['beneficios'])) {
            $decoded    = json_decode($validated['beneficios'], true);
            $beneficios = is_array($decoded) ? $decoded : [];
        }

        $plan->update([
            'nombre'                 => $validated['nombre'],
            'tipo'                   => $validated['tipo'],
            'precio'                 => $validated['precio'],
            'descripcion'            => $validated['descripcion'] ?? null,
            'clases_por_semana'      => ($validated['es_ilimitado'] ?? false) ? null : ($validated['clases_por_semana'] ?? null),
            'es_ilimitado'           => $validated['es_ilimitado'] ?? false,
            'incluye_personalizadas' => $validated['incluye_personalizadas'] ?? false,
            'activo'                 => $validated['activo'] ?? $plan->activo,
            'foto'                   => $fotoPath,
            'color_fondo'            => $validated['color_fondo'] ?? $plan->color_fondo,
            'beneficios'             => $beneficios,
        ]);

        return redirect()->back()->with('success', '¡Plan actualizado exitosamente!');
    }

    public function destroy(Plan $plan)
    {
        // Verificar si hay clientes con este plan activo
        $clientesActivos = $plan->clientePlanes()->where('estado', 'activo')->count();
        if ($clientesActivos > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar este plan: tiene {$clientesActivos} cliente(s) activo(s).",
            ]);
        }

        if ($plan->foto) {
            Storage::disk('public')->delete($plan->foto);
        }

        $plan->delete();

        return redirect()->back()->with('success', '¡Plan eliminado exitosamente!');
    }

    public function toggleActivo(Plan $plan)
    {
        $plan->update(['activo' => !$plan->activo]);
        $estado = $plan->activo ? 'activado' : 'desactivado';
        return redirect()->back()->with('success', "Plan {$estado} correctamente.");
    }
}

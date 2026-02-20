<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TipoClase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TipoClaseController extends Controller
{
    /**
     * Mostrar lista de tipos de clase
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $tiposClase = TipoClase::query()
            ->when($search, function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            })
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/TiposClase/Index', [
            'tiposClase' => $tiposClase,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Guardar nuevo tipo de clase
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:tipos_clase,nombre',
            'descripcion' => 'nullable|string',
            'color' => 'required|string|max:7',
            'activo' => 'boolean',
        ], [
            'nombre.required' => 'El nombre es obligatorio',
            'nombre.unique' => 'Ya existe un tipo de clase con este nombre',
            'color.required' => 'Debes seleccionar un color',
        ]);

        TipoClase::create($validated);

        return redirect()->back()->with('success', '¡Tipo de clase creado exitosamente!');
    }

    /**
     * Actualizar tipo de clase
     */
    public function update(Request $request, TipoClase $tipoClase)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:tipos_clase,nombre,' . $tipoClase->id,
            'descripcion' => 'nullable|string',
            'color' => 'required|string|max:7',
            'activo' => 'boolean',
        ], [
            'nombre.required' => 'El nombre es obligatorio',
            'nombre.unique' => 'Ya existe un tipo de clase con este nombre',
            'color.required' => 'Debes seleccionar un color',
        ]);

        $tipoClase->update($validated);

        return redirect()->back()->with('success', '¡Tipo de clase actualizado exitosamente!');
    }

    /**
     * Eliminar tipo de clase
     */
    public function destroy(TipoClase $tipoClase)
    {
        // Verificar si tiene clases asociadas
        if ($tipoClase->clases()->count() > 0) {
            return redirect()->back()->withErrors([
                'delete' => 'No se puede eliminar este tipo de clase porque tiene clases asociadas.'
            ]);
        }

        $tipoClase->delete();

        return redirect()->back()->with('success', '¡Tipo de clase eliminado exitosamente!');
    }

    /**
     * Activar/Desactivar tipo de clase
     */
    public function toggleActivo(TipoClase $tipoClase)
    {
        $tipoClase->update([
            'activo' => !$tipoClase->activo
        ]);

        $estado = $tipoClase->activo ? 'activado' : 'desactivado';

        return redirect()->back()->with('success', "¡Tipo de clase {$estado} exitosamente!");
    }
}

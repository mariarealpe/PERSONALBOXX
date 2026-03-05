<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\User;
use App\Models\TipoClase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InstructorController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $instructores = Instructor::with(['user', 'especialidades'])
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                    ->orWhere('especialidad', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $tiposClase = TipoClase::where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'color']);

        return Inertia::render('Admin/Instructores/Index', [
            'instructores' => $instructores,
            'tiposClase' => $tiposClase,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'especialidad' => 'nullable|string|max:255',
            'tarifa_por_clase' => 'nullable|numeric|min:0',
            'tarifa_por_asistente' => 'nullable|numeric|min:0',
            'biografia' => 'nullable|string',
            'foto' => 'nullable|image|max:2048',
            'especialidades_ids' => 'nullable|array',
            'especialidades_ids.*' => 'exists:tipos_clase,id',
            'activo' => 'boolean',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El correo es obligatorio',
            'email.unique' => 'Este correo ya está registrado',
            'password.required' => 'La contraseña es obligatoria',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'foto.image' => 'El archivo debe ser una imagen',
            'foto.max' => 'La imagen no debe pesar más de 2MB',
        ]);

        // Crear usuario
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        // Asignar rol de instructor
        $user->assignRole('instructor');

        // Subir foto si existe
        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('instructores', 'public');
        }

        // Crear instructor
        $instructor = Instructor::create([
            'user_id' => $user->id,
            'especialidad' => $validated['especialidad'],
            'tarifa_por_clase' => $validated['tarifa_por_clase'],
            'tarifa_por_asistente' => $validated['tarifa_por_asistente'],
            'biografia' => $validated['biografia'],
            'foto' => $fotoPath,
            'activo' => $validated['activo'] ?? true,
        ]);

        // Asignar especialidades (tipos de clase)
        if (!empty($validated['especialidades_ids'])) {
            $instructor->especialidades()->sync($validated['especialidades_ids']);
        }

        return redirect()->back()->with('success', '¡Instructor creado exitosamente!');
    }

    public function update(Request $request, Instructor $instructor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $instructor->user_id,
            'password' => 'nullable|string|min:8',
            'especialidad' => 'nullable|string|max:255',
            'tarifa_por_clase' => 'nullable|numeric|min:0',
            'tarifa_por_asistente' => 'nullable|numeric|min:0',
            'biografia' => 'nullable|string',
            'foto' => 'nullable|image|max:2048',
            'especialidades_ids' => 'nullable|array',
            'especialidades_ids.*' => 'exists:tipos_clase,id',
            'activo' => 'boolean',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El correo es obligatorio',
            'email.unique' => 'Este correo ya está registrado',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'foto.image' => 'El archivo debe ser una imagen',
            'foto.max' => 'La imagen no debe pesar más de 2MB',
        ]);

        // Actualizar usuario
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $instructor->user->update($userData);

        // Subir nueva foto si existe
        if ($request->hasFile('foto')) {
            // Eliminar foto anterior
            if ($instructor->foto) {
                Storage::disk('public')->delete($instructor->foto);
            }
            $validated['foto'] = $request->file('foto')->store('instructores', 'public');
        }

        // Actualizar instructor
        $instructor->update([
            'especialidad' => $validated['especialidad'],
            'tarifa_por_clase' => $validated['tarifa_por_clase'],
            'tarifa_por_asistente' => $validated['tarifa_por_asistente'],
            'biografia' => $validated['biografia'],
            'foto' => $validated['foto'] ?? $instructor->foto,
            'activo' => $validated['activo'] ?? $instructor->activo,
        ]);

        // Actualizar especialidades
        if (isset($validated['especialidades_ids'])) {
            $instructor->especialidades()->sync($validated['especialidades_ids']);
        }

        return redirect()->back()->with('success', '¡Instructor actualizado exitosamente!');
    }

    public function destroy(Instructor $instructor)
    {
        // Verificar si tiene clases asignadas
        if ($instructor->clases()->count() > 0) {
            return redirect()->back()->withErrors([
                'delete' => 'No se puede eliminar este instructor porque tiene clases asignadas.'
            ]);
        }

        // Eliminar foto
        if ($instructor->foto) {
            Storage::disk('public')->delete($instructor->foto);
        }

        // Eliminar usuario
        $instructor->user->delete();

        // Eliminar instructor (cascade eliminará relaciones)
        $instructor->delete();

        return redirect()->back()->with('success', '¡Instructor eliminado exitosamente!');
    }

    public function toggleActivo(Instructor $instructor)
    {
        $instructor->update([
            'activo' => !$instructor->activo
        ]);

        $estado = $instructor->activo ? 'activado' : 'desactivado';

        return redirect()->back()->with('success', "¡Instructor {$estado} exitosamente!");
    }
}

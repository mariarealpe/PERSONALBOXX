<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\TipoClaseController;
use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\ClaseController;
use App\Http\Controllers\Admin\ClienteController;
use App\Http\Controllers\Admin\AsistenciaController;
use App\Http\Controllers\Admin\ReporteController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\Instructor\InstructorController as InstructorPortalController;
use App\Http\Controllers\Cliente\ClienteController as ClientePortalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update'); // POST para FormData con _method:PATCH
    Route::patch('/profile', [ProfileController::class, 'update']);                        // PATCH normal como respaldo
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rutas de Administrador
Route::middleware(['auth', 'role:administrador'])->prefix('admin')->name('admin.')->group(function () {

    // Tipos de Clase
    Route::get('/tipos-clase', [TipoClaseController::class, 'index'])->name('tipos-clase.index');
    Route::post('/tipos-clase', [TipoClaseController::class, 'store'])->name('tipos-clase.store');
    Route::put('/tipos-clase/{tipoClase}', [TipoClaseController::class, 'update'])->name('tipos-clase.update');
    Route::delete('/tipos-clase/{tipoClase}', [TipoClaseController::class, 'destroy'])->name('tipos-clase.destroy');
    Route::patch('/tipos-clase/{tipoClase}/toggle', [TipoClaseController::class, 'toggleActivo'])->name('tipos-clase.toggle');

    // Instructores
    Route::get('/instructores', [InstructorController::class, 'index'])->name('instructores.index');
    Route::post('/instructores', [InstructorController::class, 'store'])->name('instructores.store');
    Route::put('/instructores/{instructor}', [InstructorController::class, 'update'])->name('instructores.update');
    Route::delete('/instructores/{instructor}', [InstructorController::class, 'destroy'])->name('instructores.destroy');
    Route::patch('/instructores/{instructor}/toggle', [InstructorController::class, 'toggleActivo'])->name('instructores.toggle');

    // Clases
    Route::get('/clases', [ClaseController::class, 'index'])->name('clases.index');
    Route::post('/clases', [ClaseController::class, 'store'])->name('clases.store');
    Route::put('/clases/{clase}', [ClaseController::class, 'update'])->name('clases.update');
    Route::delete('/clases/{clase}', [ClaseController::class, 'destroy'])->name('clases.destroy');
    Route::patch('/clases/{clase}/estado', [ClaseController::class, 'toggleEstado'])->name('clases.estado');

    // Clientes
    Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');
    Route::post('/clientes', [ClienteController::class, 'store'])->name('clientes.store');
    Route::put('/clientes/{user}', [ClienteController::class, 'update'])->name('clientes.update');
    Route::delete('/clientes/{user}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
    Route::get('/clientes/{user}', [ClienteController::class, 'show'])->name('clientes.show');
    Route::post('/clientes/{user}/plan', [ClienteController::class, 'asignarPlan'])->name('clientes.plan');

    // Asistencias
    Route::get('/asistencias', [AsistenciaController::class, 'index'])->name('asistencias.index');
    Route::post('/asistencias', [AsistenciaController::class, 'registrar'])->name('asistencias.registrar');
    Route::delete('/asistencias/{asistencia}', [AsistenciaController::class, 'eliminar'])->name('asistencias.eliminar');

    // Reportes
    Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
    Route::get('/reportes/asistencia-clase', [ReporteController::class, 'asistenciaClase'])->name('reportes.asistencia-clase');
    Route::get('/reportes/liquidacion', [ReporteController::class, 'liquidacionInstructor'])->name('reportes.liquidacion');
    Route::get('/reportes/liquidacion/historial',
        [App\Http\Controllers\Admin\LiquidacionHistorialController::class, 'index'])
        ->name('reportes.liquidacion.historial');
    Route::post('/reportes/liquidacion/historial',
        [App\Http\Controllers\Admin\LiquidacionHistorialController::class, 'store'])
        ->name('reportes.liquidacion.historial.store');
    Route::delete('/reportes/liquidacion/historial/{liquidacion}',
        [App\Http\Controllers\Admin\LiquidacionHistorialController::class, 'destroy'])
        ->name('reportes.liquidacion.historial.destroy');
});

// Rutas de Instructor
Route::middleware(['auth', 'role:instructor'])
    ->prefix('instructor')
    ->name('instructor.')
    ->group(function () {
        Route::get('/clases', [InstructorPortalController::class, 'clases'])->name('clases.index');
        Route::get('/asistencias', [InstructorPortalController::class, 'asistencias'])->name('asistencias.index');
        Route::post('/asistencias', [InstructorPortalController::class, 'registrarAsistencia'])->name('asistencias.registrar');
        Route::delete('/asistencias/{asistencia}', [InstructorPortalController::class, 'eliminarAsistencia'])->name('asistencias.eliminar');
        Route::get('/liquidacion', [InstructorPortalController::class, 'liquidacion'])->name('liquidacion.index');
    });

// Rutas de Cliente
Route::middleware(['auth', 'role:cliente'])
    ->prefix('cliente')
    ->name('cliente.')
    ->group(function () {
        Route::get('/clases', [ClientePortalController::class, 'clases'])->name('clases.index');
        Route::post('/clases/reservar', [ClientePortalController::class, 'reservar'])->name('clases.reservar');
        Route::get('/reservas', [ClientePortalController::class, 'reservas'])->name('reservas.index');
        Route::patch('/reservas/{reserva}/cancelar', [ClientePortalController::class, 'cancelarReserva'])->name('reservas.cancelar');
        Route::get('/historial', [ClientePortalController::class, 'historial'])->name('historial.index');
        Route::get('/mi-plan', [ClientePortalController::class, 'miPlan'])->name('mi-plan.index');
    });

Route::get('/2fa', function () {
    return Inertia::render('Auth/TwoFactor');
})->name('2fa.form');

Route::post('/2fa', [TwoFactorController::class, 'verify'])->name('2fa.verify');

require __DIR__.'/auth.php';

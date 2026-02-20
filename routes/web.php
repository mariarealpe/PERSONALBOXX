<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\TipoClaseController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ⬇️⬇️⬇️ PEGA AQUÍ LAS RUTAS DE ADMIN ⬇️⬇️⬇️
// Rutas de Administrador
Route::middleware(['auth', 'role:administrador'])->prefix('admin')->name('admin.')->group(function () {

    // Tipos de Clase
    Route::get('/tipos-clase', [TipoClaseController::class, 'index'])
        ->name('tipos-clase.index');

    Route::post('/tipos-clase', [TipoClaseController::class, 'store'])
        ->name('tipos-clase.store');

    Route::put('/tipos-clase/{tipoClase}', [TipoClaseController::class, 'update'])
        ->name('tipos-clase.update');

    Route::delete('/tipos-clase/{tipoClase}', [TipoClaseController::class, 'destroy'])
        ->name('tipos-clase.destroy');

    Route::patch('/tipos-clase/{tipoClase}/toggle', [TipoClaseController::class, 'toggleActivo'])
        ->name('tipos-clase.toggle');
});
// ⬆️⬆️⬆️ FIN RUTAS DE ADMIN ⬆️⬆️⬆️

use App\Http\Controllers\Auth\TwoFactorController;

Route::get('/2fa', function () {
    return Inertia::render('Auth/TwoFactor');
})->name('2fa.form');

Route::post('/2fa', [TwoFactorController::class, 'verify'])
    ->name('2fa.verify');

require __DIR__.'/auth.php';

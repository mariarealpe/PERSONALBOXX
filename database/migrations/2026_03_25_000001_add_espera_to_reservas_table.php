<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            // Cambiar ENUM para agregar 'en_espera'
            // En MySQL se hace así:
            $table->enum('estado', ['confirmada', 'en_espera', 'cancelada', 'completada'])
                ->default('confirmada')
                ->change();

            // Posición en la lista de espera (null si no está en espera)
            $table->unsignedSmallInteger('posicion_espera')->nullable()->after('estado');

            // Cuándo fue notificado de cupo disponible
            $table->timestamp('notificado_cupo_at')->nullable()->after('posicion_espera');
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn(['posicion_espera', 'notificado_cupo_at']);
            $table->enum('estado', ['confirmada', 'cancelada', 'completada'])
                ->default('confirmada')
                ->change();
        });
    }
};

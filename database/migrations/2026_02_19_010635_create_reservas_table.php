<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('clase_id')->constrained('clases')->onDelete('cascade');
            $table->enum('estado', ['confirmada', 'cancelada', 'completada'])->default('confirmada');
            $table->timestamp('fecha_reserva')->useCurrent();
            $table->timestamp('fecha_cancelacion')->nullable();
            $table->timestamps();

            // Un cliente no puede reservar dos veces la misma clase
            $table->unique(['cliente_id', 'clase_id']);

            // Índices para consultas rápidas
            $table->index(['cliente_id', 'estado']);
            $table->index('clase_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};

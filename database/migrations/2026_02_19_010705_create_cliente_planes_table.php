<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_planes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('planes')->onDelete('cascade');
            $table->date('fecha_inicio');
            $table->date('fecha_vencimiento'); // 30 días desde fecha_inicio
            $table->enum('estado', ['activo', 'vencido', 'cancelado'])->default('activo');
            $table->integer('clases_usadas_semana')->default(0); // Se reinicia cada lunes
            $table->date('ultima_fecha_reinicio')->nullable(); // Para saber cuándo reiniciar el contador
            $table->timestamps();

            // Índice para consultas de planes activos
            $table->index(['cliente_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_planes');
    }
};

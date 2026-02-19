<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horario_clase_id')->constrained('horarios_clase')->onDelete('cascade');
            $table->foreignId('tipo_clase_id')->constrained('tipos_clase')->onDelete('cascade');
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('fecha_hora_inicio');
            $table->dateTime('fecha_hora_fin');
            $table->integer('capacidad_maxima');
            $table->string('sala')->nullable();
            $table->enum('estado', ['programada', 'en_curso', 'finalizada', 'cancelada'])->default('programada');
            $table->timestamps();

            // Índice para búsquedas rápidas por fecha
            $table->index('fecha_hora_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clases');
    }
};

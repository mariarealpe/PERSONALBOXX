<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesiones_personalizadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('fecha_hora');
            $table->integer('duracion_minutos')->default(60);
            $table->enum('tipo', ['semi_personalizada', 'personalizada'])->default('personalizada');
            $table->enum('estado', ['programada', 'completada', 'cancelada'])->default('programada');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones_personalizadas');
    }
};

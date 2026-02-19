<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clase_id')->constrained('clases')->onDelete('cascade');
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->boolean('tenia_reserva')->default(false); // true si tenía reserva, false si es walk-in
            $table->timestamp('hora_registro')->useCurrent();
            $table->foreignId('registrado_por')->constrained('users'); // Instructor o admin
            $table->timestamps();

            // Un cliente no puede tener dos asistencias en la misma clase
            $table->unique(['clase_id', 'cliente_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};

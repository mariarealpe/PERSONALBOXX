<?php
// Ruta: database/migrations/2026_03_16_000001_create_liquidaciones_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('liquidaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('instructores')->onDelete('cascade');
            $table->foreignId('aprobado_por')->constrained('users')->onDelete('cascade'); // admin que aprobó
            $table->date('fecha_inicio');       // período inicio
            $table->date('fecha_fin');          // período fin
            $table->integer('total_clases');
            $table->integer('total_asistentes');
            $table->string('tipo_tarifa');      // 'por_clase' | 'por_asistente'
            $table->decimal('tarifa_aplicada', 10, 2);
            $table->decimal('total_pago', 10, 2);
            $table->date('fecha_pago');         // cuándo se pagó
            $table->text('notas')->nullable();  // observaciones opcionales
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidaciones');
    }
};

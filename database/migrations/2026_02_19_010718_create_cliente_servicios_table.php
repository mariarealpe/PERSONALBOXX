<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_servicios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('servicio_id')->constrained('servicios_adicionales')->onDelete('cascade');
            $table->date('fecha_compra');
            $table->date('fecha_uso')->nullable();
            $table->dateTime('fecha_hora_cita')->nullable(); // Para servicios que requieren cita
            $table->enum('estado', ['pendiente', 'usado', 'expirado', 'cancelado'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_servicios');
    }
};

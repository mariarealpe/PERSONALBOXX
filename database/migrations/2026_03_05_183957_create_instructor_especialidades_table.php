<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_especialidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('instructores')->onDelete('cascade');
            $table->foreignId('tipo_clase_id')->constrained('tipos_clase')->onDelete('cascade');
            $table->timestamps();

            // Evitar duplicados
            $table->unique(['instructor_id', 'tipo_clase_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_especialidades');
    }
};

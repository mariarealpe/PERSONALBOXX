<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('planes', function (Blueprint $table) {
            // Foto de portada del plan (opcional, puede ser null si usa color)
            $table->string('foto')->nullable()->after('descripcion');
            // Color de fondo cuando no hay foto (hex, ej: #FF1493)
            $table->string('color_fondo', 7)->nullable()->default('#1a1a2e')->after('foto');
            // Beneficios adicionales en formato JSON (lista de strings)
            $table->json('beneficios')->nullable()->after('color_fondo');
        });
    }

    public function down(): void
    {
        Schema::table('planes', function (Blueprint $table) {
            $table->dropColumn(['foto', 'color_fondo', 'beneficios']);
        });
    }
};

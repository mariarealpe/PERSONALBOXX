<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Estado del ciclo de vida del cliente
            // 'activo' como default para que admin/instructor existentes no queden bloqueados
            $table->enum('estado_cuenta', ['pendiente', 'activo', 'logueado', 'inactivo'])
                ->default('activo')
                ->nullable()
                ->after('email_verified_at');

            // Token único de activación (UUID)
            $table->string('token_activacion', 100)->nullable()->unique()->after('estado_cuenta');

            // Expiración del token (24 horas desde la creación)
            $table->timestamp('token_expiracion')->nullable()->after('token_activacion');

            // Admin que creó este cliente
            $table->unsignedBigInteger('creado_por')->nullable()->after('token_expiracion');
            $table->foreign('creado_por')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['creado_por']);
            $table->dropColumn(['estado_cuenta', 'token_activacion', 'token_expiracion', 'creado_por']);
        });
    }
};

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\SendOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ActivarCuentaController extends Controller
{
    const MAX_INTENTOS = 3;

    public function show(Request $request)
    {
        $token = $request->query('token');

        if (!$token) {
            return Inertia::render('Auth/ActivarCuenta', [
                'token' => null, 'email' => null,
                'error' => 'Enlace de activación inválido. Contacta al administrador.',
            ]);
        }

        $user = User::where('token_activacion', $token)
            ->where('estado_cuenta', 'pendiente')
            ->first();

        if (!$user) {
            return Inertia::render('Auth/ActivarCuenta', [
                'token' => $token, 'email' => null,
                'error' => 'Este enlace de activación no es válido o ya fue utilizado.',
            ]);
        }

        if ($user->token_expiracion && now()->isAfter($user->token_expiracion)) {
            return Inertia::render('Auth/ActivarCuenta', [
                'token' => $token, 'email' => null,
                'error' => 'Este enlace de activación ha expirado (válido por 24 horas). Contacta al administrador para que te reenvíe el correo.',
            ]);
        }

        return Inertia::render('Auth/ActivarCuenta', [
            'token' => $token,
            'email' => $user->email,
            'error' => null,
        ]);
    }

    public function completarRegistro(Request $request)
    {
        $request->validate([
            'token'                 => 'required|string',
            'name'                  => 'required|string|max:255',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ], [
            'name.required'                  => 'El nombre de usuario es obligatorio',
            'password.required'              => 'La contraseña es obligatoria',
            'password.min'                   => 'La contraseña debe tener al menos 8 caracteres',
            'password.confirmed'             => 'Las contraseñas no coinciden',
            'password_confirmation.required' => 'Debes confirmar la contraseña',
        ]);

        $user = User::where('token_activacion', $request->token)
            ->where('estado_cuenta', 'pendiente')
            ->first();

        if (!$user) {
            return back()->withErrors(['token' => 'El enlace de activación no es válido.']);
        }

        if ($user->token_expiracion && now()->isAfter($user->token_expiracion)) {
            return back()->withErrors(['token' => 'El enlace de activación ha expirado. Contacta al administrador.']);
        }

        $user->update([
            'name'         => $request->name,
            'password'     => Hash::make($request->password),
            'otp_intentos' => 0,  // resetear por si acaso
        ]);

        $otp = rand(100000, 999999);
        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(5),
            'otp_intentos'   => 0,
        ]);

        try {
            Mail::to($user->email)->send(new SendOtpMail($otp));
        } catch (\Throwable $e) {
            Log::error("OTP de activación fallido para {$user->email}: " . $e->getMessage());
        }

        session([
            'activacion_user_id' => $user->id,
            'activacion_token'   => $request->token,
        ]);

        return redirect()->route('activar-cuenta.verificar-otp');
    }

    public function showVerificarOtp()
    {
        $userId = session('activacion_user_id');

        if (!$userId) {
            return redirect()->route('login')->withErrors([
                'otp' => 'Sesión expirada. Usa el enlace de activación nuevamente.'
            ]);
        }

        $user  = User::find($userId);
        $intentosRestantes = self::MAX_INTENTOS - ($user?->otp_intentos ?? 0);

        return Inertia::render('Auth/ActivarCuentaOtp', [
            'email'             => $user?->email,
            'intentos_restantes'=> max(0, $intentosRestantes),
        ]);
    }

    public function verificarOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|numeric|digits:6',
        ], [
            'otp.required' => 'Ingresa el código de verificación.',
            'otp.digits'   => 'El código debe tener exactamente 6 dígitos.',
        ]);

        $userId = session('activacion_user_id');
        $token  = session('activacion_token');

        if (!$userId || !$token) {
            return redirect()->route('login')->withErrors([
                'otp' => 'Sesión expirada. Usa el enlace de activación nuevamente.'
            ]);
        }

        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login')->withErrors(['otp' => 'Usuario no encontrado.']);
        }

        if (!$user->otp_code) {
            return redirect()->route('login')->withErrors([
                'otp' => 'No hay código activo. Inicia el proceso desde el enlace de activación.'
            ]);
        }

        // Verificar expiración
        if ($user->otp_expires_at && now()->isAfter($user->otp_expires_at)) {
            $user->update(['otp_code' => null, 'otp_expires_at' => null, 'otp_intentos' => 0]);
            session()->forget(['activacion_user_id', 'activacion_token']);

            return back()->withErrors([
                'otp' => 'El código expiró. Contacta al administrador para reenviar el correo de activación.'
            ]);
        }

        // ── RF-21: Verificar límite de intentos ──────────────────────────────
        if ($user->otp_intentos >= self::MAX_INTENTOS) {
            $user->update(['otp_code' => null, 'otp_expires_at' => null, 'otp_intentos' => 0]);
            session()->forget(['activacion_user_id', 'activacion_token']);

            return redirect()->route('login')->withErrors([
                'otp' => 'Superaste el límite de ' . self::MAX_INTENTOS . ' intentos. Contacta al administrador para reenviar el correo de activación.'
            ]);
        }
        // ────────────────────────────────────────────────────────────────────

        if ((string)$user->otp_code !== (string)$request->otp) {
            $intentosRestantes = self::MAX_INTENTOS - ($user->otp_intentos + 1);
            $user->increment('otp_intentos');

            if ($intentosRestantes <= 0) {
                return back()->withErrors([
                    'otp' => 'Código incorrecto. Has agotado todos los intentos. Contacta al administrador.'
                ])->withInput();
            }

            return back()->withErrors([
                'otp' => "Código incorrecto. Te quedan {$intentosRestantes} intento(s)."
            ])->withInput();
        }

        // ── RF-22: Activar la cuenta ─────────────────────────────────────────
        $user->update([
            'estado_cuenta'     => 'logueado',
            'email_verified_at' => now(),
            'token_activacion'  => null,
            'token_expiracion'  => null,
            'otp_code'          => null,
            'otp_expires_at'    => null,
            'otp_intentos'      => 0,
        ]);

        session()->forget(['activacion_user_id', 'activacion_token']);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', '🎉 ¡Cuenta activada correctamente! Bienvenido/a a Personal Box.');
    }
}

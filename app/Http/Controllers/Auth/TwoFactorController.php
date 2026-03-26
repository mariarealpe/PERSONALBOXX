<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TwoFactorController extends Controller
{
    // ── RF-21: Máximo de intentos fallidos permitidos ────────────────────────
    const MAX_INTENTOS = 3;

    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|numeric|digits:6',
        ], [
            'otp.required' => 'Por favor ingresa el código.',
            'otp.numeric'  => 'El código debe contener solo números.',
            'otp.digits'   => 'El código debe tener exactamente 6 dígitos.',
        ]);

        $userId = session('2fa_user_id');

        if (!$userId) {
            return redirect()->route('login')->withErrors([
                'otp' => 'Sesión expirada. Por favor inicia sesión nuevamente.'
            ]);
        }

        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login')->withErrors([
                'otp' => 'Usuario no encontrado. Inicia sesión nuevamente.'
            ]);
        }

        if (!$user->otp_code) {
            return redirect()->route('login')->withErrors([
                'otp' => 'No se encontró un código de verificación. Inicia sesión nuevamente.'
            ]);
        }

        // ── RF-21: Verificar expiración ──────────────────────────────────────
        if (!$user->otp_expires_at || now()->gte($user->otp_expires_at)) {
            $user->update([
                'otp_code'       => null,
                'otp_expires_at' => null,
                'otp_intentos'   => 0,
            ]);
            session()->forget('2fa_user_id');

            return back()->withErrors([
                'otp' => 'El código ha expirado. Por favor inicia sesión nuevamente.'
            ]);
        }

        // ── RF-21: Verificar límite de intentos ──────────────────────────────
        if ($user->otp_intentos >= self::MAX_INTENTOS) {
            // Invalidar el código — debe iniciar sesión de nuevo para obtener uno nuevo
            $user->update([
                'otp_code'       => null,
                'otp_expires_at' => null,
                'otp_intentos'   => 0,
            ]);
            session()->forget('2fa_user_id');

            return redirect()->route('login')->withErrors([
                'otp' => 'Superaste el límite de ' . self::MAX_INTENTOS . ' intentos. Por favor inicia sesión nuevamente para obtener un nuevo código.'
            ]);
        }
        // ────────────────────────────────────────────────────────────────────

        if ($user->otp_code === $request->otp) {
            // ✅ Código correcto — limpiar todo
            Auth::login($user);

            $user->update([
                'otp_code'       => null,
                'otp_expires_at' => null,
                'otp_intentos'   => 0,
            ]);

            // RF-23: Marcar como logueado
            if (in_array($user->estado_cuenta, ['activo', null])) {
                $user->update(['estado_cuenta' => 'logueado']);
            }

            session()->forget('2fa_user_id');
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        // ❌ Código incorrecto — incrementar contador
        $intentosRestantes = self::MAX_INTENTOS - ($user->otp_intentos + 1);
        $user->increment('otp_intentos');

        if ($intentosRestantes <= 0) {
            // Este era el último intento — en el próximo request se detectará y bloqueará
            return back()->withErrors([
                'otp' => 'Código inválido. Has agotado todos los intentos. Por favor inicia sesión nuevamente.'
            ])->withInput();
        }

        return back()->withErrors([
            'otp' => "Código inválido. Te quedan {$intentosRestantes} intento(s)."
        ])->withInput();
    }
}

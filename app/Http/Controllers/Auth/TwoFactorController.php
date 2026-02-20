<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TwoFactorController extends Controller
{
    public function verify(Request $request)
    {
        // Validar que el código sea de 6 dígitos numéricos
        $request->validate([
            'otp' => 'required|numeric|digits:6'
        ], [
            'otp.required' => 'Por favor ingresa el código.',
            'otp.numeric' => 'El código debe contener solo números.',
            'otp.digits' => 'El código debe tener exactamente 6 dígitos.'
        ]);

        // Obtener el ID del usuario de la sesión
        $userId = session('2fa_user_id');

        // Verificar que existe la sesión 2FA
        if (!$userId) {
            return redirect()->route('login')->withErrors([
                'otp' => 'Sesión expirada. Por favor inicia sesión nuevamente.'
            ]);
        }

        // Buscar el usuario
        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login')->withErrors([
                'otp' => 'Usuario no encontrado. Inicia sesión nuevamente.'
            ]);
        }

        // Verificar que el usuario tiene un código OTP
        if (!$user->otp_code) {
            return redirect()->route('login')->withErrors([
                'otp' => 'No se encontró un código de verificación. Inicia sesión nuevamente.'
            ]);
        }

        // Verificar que el código no ha expirado
        if (!$user->otp_expires_at || now()->gte($user->otp_expires_at)) {
            // Limpiar código expirado
            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null
            ]);

            session()->forget('2fa_user_id');

            return back()->withErrors([
                'otp' => 'El código ha expirado. Por favor inicia sesión nuevamente.'
            ]);
        }

        // Validar el código (comparación estricta)
        if ($user->otp_code === $request->otp) {
            // ✅ CÓDIGO CORRECTO

            // Autenticar al usuario
            Auth::login($user);

            // Limpiar campos OTP de la base de datos
            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null
            ]);

            // Eliminar sesión temporal 2FA
            session()->forget('2fa_user_id');

            // Regenerar sesión por seguridad
            $request->session()->regenerate();

            // Redirigir al dashboard
            return redirect()->intended('dashboard');
        }

        // ❌ CÓDIGO INCORRECTO
        return back()->withErrors([
            'otp' => 'Código inválido. Verifica e intenta nuevamente.'
        ])->withInput();
    }
}

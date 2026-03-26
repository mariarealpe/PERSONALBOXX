<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Mail\SendOtpMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status'           => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        // ── RF-23: Bloquear acceso si la cuenta está pendiente o inactiva ────
        if (in_array($user->estado_cuenta, ['pendiente', 'inactivo'])) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $mensaje = $user->estado_cuenta === 'pendiente'
                ? 'Tu cuenta aún no está activada. Revisa tu correo para encontrar el enlace de activación.'
                : 'Tu cuenta está desactivada. Contacta al administrador para más información.';

            return redirect()->route('login')->withErrors(['email' => $mensaje]);
        }
        // ─────────────────────────────────────────────────────────────────────

        // Generar y enviar OTP para 2FA
        $otp = rand(100000, 999999);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new SendOtpMail($otp));

        // Cerrar sesión temporalmente hasta validar el 2FA
        Auth::logout();
        session(['2fa_user_id' => $user->id]);

        return redirect()->route('2fa.form');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

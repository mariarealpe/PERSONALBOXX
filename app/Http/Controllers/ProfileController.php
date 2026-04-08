<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Mail\SendOtpMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        // Cargar roles para que el frontend use el layout correcto según rol
        $user = $request->user()->load('roles');

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
            'emailChange'     => [
                'pending'       => (bool) session('profile.email_pending'),
                'pending_email' => session('profile.email_pending'),
            ],
            'auth'            => [
                'user' => array_merge(
                    $user->only(['id', 'name', 'email', 'email_verified_at']),
                    [
                        'foto_url' => $user->foto_url,
                        'roles'    => $user->roles->map(fn($r) => ['name' => $r->name])->values()->toArray(),
                    ]
                ),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255'],
            'foto'  => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'otp'   => 'nullable|digits:6',
        ]);

        $user = $request->user();
        $newEmail = mb_strtolower(trim((string) $request->email));
        $currentEmail = mb_strtolower((string) $user->email);
        $emailChanged = $newEmail !== $currentEmail;

        // Validar unicidad si intenta cambiar email
        if ($emailChanged) {
            $request->validate([
                'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            ]);
        }

        // Siempre permitir actualizar nombre/foto
        $user->name = $request->name;

        if ($request->hasFile('foto')) {
            if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                Storage::disk('public')->delete($user->foto);
            }
            $path = $request->file('foto')->store('fotos_perfil', 'public');
            $user->foto = $path;
        }

        // Si no cambió email, guardar normal
        if (!$emailChanged) {
            $user->save();
            return Redirect::route('profile.edit')->with('status', 'profile-updated');
        }

        // Cambio de email - fase 1: enviar OTP
        if (!$request->filled('otp')) {
            $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            session([
                'profile.email_pending'        => $newEmail,
                'profile.email_otp'            => $otp,
                'profile.email_otp_expires_at' => now()->addMinutes(5)->timestamp,
            ]);

            Mail::to($newEmail)->send(new SendOtpMail($otp, 'email_change', $newEmail));

            $user->save(); // guarda nombre/foto si cambiaron
            return Redirect::route('profile.edit')->with('status', 'email-change-otp-sent');
        }

        // Cambio de email - fase 2: validar OTP y confirmar
        $pendingEmail = (string) session('profile.email_pending');
        $sessionOtp = (string) session('profile.email_otp');
        $expiresAtTs = (int) session('profile.email_otp_expires_at');

        if (!$pendingEmail || !$sessionOtp || !$expiresAtTs) {
            return Redirect::back()->withErrors(['otp' => 'No hay una solicitud pendiente. Solicita un nuevo código.']);
        }

        if ($pendingEmail !== $newEmail) {
            return Redirect::back()->withErrors(['otp' => 'El correo no coincide con la solicitud pendiente.']);
        }

        if (now()->timestamp > $expiresAtTs) {
            session()->forget(['profile.email_pending', 'profile.email_otp', 'profile.email_otp_expires_at']);
            return Redirect::back()->withErrors(['otp' => 'El código expiró. Solicita uno nuevo.']);
        }

        if ((string) $request->otp !== $sessionOtp) {
            return Redirect::back()->withErrors(['otp' => 'Código incorrecto.']);
        }

        $user->email = $pendingEmail;
        $user->email_verified_at = null;
        $user->save();

        session()->forget(['profile.email_pending', 'profile.email_otp', 'profile.email_otp_expires_at']);

        return Redirect::route('profile.edit')->with('status', 'email-change-confirmed');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if ($user->foto && Storage::disk('public')->exists($user->foto)) {
            Storage::disk('public')->delete($user->foto);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

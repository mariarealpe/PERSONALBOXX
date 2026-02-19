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
        $request->validate([
            'otp' => 'required'
        ]);

        $user = User::find(session('2fa_user_id'));

        if (!$user) {
            return redirect()->route('login');
        }

        if (
            $request->otp == $user->otp_code &&
            now()->lt($user->otp_expires_at)
        ) {
            Auth::login($user);

            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null
            ]);

            session()->forget('2fa_user_id');

            return redirect()->route('dashboard');
        }

        return back()->withErrors([
            'otp' => 'Código inválido o expirado'
        ]);
    }
}

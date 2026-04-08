import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            <div className="login-container">
                {/* Fondo con efecto neón */}
                <div className="neon-background"></div>
                <div className="grid-overlay"></div>

                {/* Partículas */}
                <div className="particles">
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                    <div className="particle p4"></div>
                </div>

                {/* Logo y título */}
                <div className="login-header">
                    <div className="logo-container">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="currentColor"/>
                        </svg>
                        <div className="logo-bar"></div>
                        <div className="logo-weights">
                            <div className="weight-left"></div>
                            <div className="weight-right"></div>
                        </div>
                    </div>
                    <h1 className="brand-name">PERSONAL BOX</h1>
                    <p className="brand-subtitle">ENTRENAMIENTO FUNCIONAL • CROSSFIT</p>
                </div>

                {/* Mensaje de estado */}
                {status && (
                    <div className="status-message" role="status" aria-live="polite">
                        {status}
                    </div>
                )}

                {/* Formulario — glassmorphism */}
                <form onSubmit={submit} className="login-form">
                    {/* Brillo interno superior */}
                    <div className="form-glass-shine"></div>

                    <h2 className="form-title">INICIAR SESIÓN</h2>

                    {/* Email */}
                    <div className="form-group">
                        <InputLabel htmlFor="email" value="CORREO ELECTRÓNICO" className="form-label" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="form-input"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="tu@email.com"
                        />
                        <InputError message={errors.email} className="error-message" />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <InputLabel htmlFor="password" value="CONTRASEÑA" className="form-label" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="form-input"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                        <InputError message={errors.password} className="error-message" />
                    </div>

                    {/* Remember me */}
                    <div className="form-group-checkbox">
                        <label className="checkbox-label">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="checkbox-text">Recordarme</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="forgot-password-link"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    {/* Botón de login — glassmorphism + neon */}
                    <PrimaryButton className="login-button" disabled={processing} aria-label="Entrar">
                        {processing ? 'INICIANDO...' : 'ENTRAR'}
                    </PrimaryButton>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p className="footer-text">ARMENIA, QUINDÍO</p>
                </div>
            </div>

            <style>{`
                *, *::before, *::after {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .login-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: #000000;
                    padding: 2rem 1.25rem;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Fondo ── */
                .neon-background {
                    position: fixed;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 70% 60% at 20% 50%, rgba(255,20,147,0.18) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 70% at 80% 80%, rgba(255,20,147,0.12) 0%, transparent 55%),
                        radial-gradient(ellipse 40% 40% at 50% 10%, rgba(255,20,147,0.08) 0%, transparent 55%);
                    animation: glow-pulse 8s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 0;
                }

                .grid-overlay {
                    position: fixed;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,20,147,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,20,147,0.03) 1px, transparent 1px);
                    background-size: 60px 60px;
                    pointer-events: none;
                    z-index: 0;
                }

                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 1; }
                }

                /* ── Partículas ── */
                .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
                .particle {
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: #FF1493;
                    animation: floatUp 9s ease-in-out infinite;
                    box-shadow: 0 0 6px #FF1493, 0 0 12px #FF1493;
                }
                .p1 { left: 8%;  animation-delay: 0s;   animation-duration: 9s; }
                .p2 { left: 35%; animation-delay: 2s;   animation-duration: 7s; }
                .p3 { left: 65%; animation-delay: 1s;   animation-duration: 11s; }
                .p4 { left: 88%; animation-delay: 3.5s; animation-duration: 8s; }

                @keyframes floatUp {
                    0%   { transform: translateY(110vh); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-10vh); opacity: 0; }
                }

                /* ── Header ── */
                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                    z-index: 1;
                }

                .logo-container {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 1.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-icon {
                    width: 56px;
                    height: 56px;
                    color: #FF1493;
                    filter: drop-shadow(0 0 20px #FF1493) drop-shadow(0 0 40px #FF1493);
                    animation: heartbeat 2s ease-in-out infinite;
                    z-index: 2;
                }

                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    10%, 30% { transform: scale(1.15); }
                    20%, 40% { transform: scale(1); }
                }

                .logo-bar {
                    position: absolute;
                    width: 80px;
                    height: 6px;
                    background: linear-gradient(90deg, transparent, #FF1493, transparent);
                    box-shadow: 0 0 10px #FF1493, 0 0 20px #FF1493;
                    z-index: 1;
                }

                .logo-weights {
                    position: absolute;
                    width: 120px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 1;
                }

                .weight-left, .weight-right {
                    width: 25px;
                    height: 40px;
                    background: linear-gradient(145deg, #FF1493, #C71585);
                    border-radius: 4px;
                    box-shadow:
                        0 0 10px #FF1493,
                        0 0 20px rgba(255,20,147,0.5),
                        inset 0 2px 4px rgba(255,255,255,0.2);
                    position: relative;
                }

                .weight-left::before, .weight-right::before {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.3);
                }

                .weight-left  { transform: rotate(-10deg); }
                .weight-right { transform: rotate(10deg); }

                .brand-name {
                    font-size: clamp(2rem, 8vw, 3.5rem);
                    font-weight: 900;
                    color: #FF1493;
                    text-transform: uppercase;
                    letter-spacing: clamp(4px, 2vw, 8px);
                    margin: 0 0 0.5rem 0;
                    text-shadow:
                        0 0 10px #FF1493,
                        0 0 20px #FF1493,
                        0 0 40px #FF1493;
                    animation: neon-flicker 3s ease-in-out infinite alternate;
                }

                @keyframes neon-flicker {
                    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
                        text-shadow:
                            0 0 10px #FF1493,
                            0 0 20px #FF1493,
                            0 0 40px #FF1493;
                    }
                    20%, 24%, 55% { text-shadow: none; }
                }

                .brand-subtitle {
                    font-size: 0.72rem;
                    color: #888;
                    letter-spacing: 3px;
                    font-weight: 600;
                }

                .status-message {
                    background: rgba(34,197,94,0.12);
                    border: 1px solid rgba(34,197,94,0.4);
                    color: #22c55e;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                    z-index: 1;
                    width: 100%;
                    max-width: 440px;
                    text-align: center;
                }

                /* ── Formulario — glassmorphism ── */
                .login-form {
                    position: relative;
                    width: 100%;
                    max-width: 440px;
                    z-index: 1;
                    padding: 2.75rem 2.25rem;
                    border-radius: 20px;
                    overflow: hidden;

                    /* glass base */
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);

                    /* bordes glass + neon */
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-top: 1px solid rgba(255, 255, 255, 0.18);

                    /* sombras: profundidad + neon glow */
                    box-shadow:
                        0 0 0 1px rgba(255, 20, 147, 0.12),
                        0 0 40px rgba(255, 20, 147, 0.18),
                        0 0 80px rgba(255, 20, 147, 0.06),
                        0 16px 48px rgba(0, 0, 0, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                /* Brillo diagonal superior (efecto cristal) */
                .form-glass-shine {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255,255,255,0.15) 30%,
                        rgba(255,20,147,0.6) 50%,
                        rgba(255,255,255,0.15) 70%,
                        transparent 100%
                    );
                    box-shadow: 0 0 12px rgba(255,20,147,0.5);
                }

                .form-title {
                    color: #FF1493;
                    font-size: 1.35rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 2rem;
                    letter-spacing: 3px;
                    text-shadow: 0 0 12px rgba(255,20,147,0.5);
                }

                .form-group {
                    margin-bottom: 1.4rem;
                }

                .form-label {
                    display: block;
                    color: rgba(255,20,147,0.85);
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .form-input {
                    width: 100%;
                    padding: 0.9rem 1rem;
                    background: rgba(0, 0, 0, 0.45);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-bottom: 1px solid rgba(255,20,147,0.25);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                }

                .form-input:focus {
                    outline: none;
                    border-color: rgba(255,20,147,0.7);
                    border-bottom-color: #FF1493;
                    background: rgba(0,0,0,0.6);
                    box-shadow:
                        0 0 0 1px rgba(255,20,147,0.2),
                        0 0 16px rgba(255,20,147,0.2);
                }

                .form-input::placeholder { color: #444; }

                .error-message {
                    color: #ef4444;
                    font-size: 0.72rem;
                    margin-top: 0.4rem;
                    text-shadow: 0 0 5px rgba(239,68,68,0.4);
                }

                .form-group-checkbox {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.75rem;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .checkbox-text {
                    color: #777;
                    font-size: 0.85rem;
                }

                .forgot-password-link {
                    color: rgba(255,20,147,0.8);
                    font-size: 0.82rem;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-weight: 600;
                }

                .forgot-password-link:hover {
                    color: #FF1493;
                    text-shadow: 0 0 8px rgba(255,20,147,0.5);
                }

                /* ── Botón login — glassmorphism + neon ── */
                .login-button {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.35s ease;
                    position: relative;
                    overflow: hidden;

                    /* glass + neon */
                    background: rgba(255, 20, 147, 0.15);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-top: 1px solid rgba(255, 255, 255, 0.22);
                    color: #FF1493;
                    box-shadow:
                        0 0 20px rgba(255, 20, 147, 0.25),
                        0 0 40px rgba(255, 20, 147, 0.08),
                        inset 0 1px 0 rgba(255, 255, 255, 0.12),
                        inset 0 -1px 0 rgba(255, 20, 147, 0.15);
                }

                /* Shimmer animado sobre el botón */
                .login-button::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(
                        120deg,
                        transparent 0%,
                        rgba(255,255,255,0.08) 50%,
                        transparent 100%
                    );
                    transition: left 0.6s ease;
                }

                .login-button:hover:not(:disabled)::before {
                    left: 160%;
                }

                .login-button:hover:not(:disabled) {
                    background: rgba(255, 20, 147, 0.28);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow:
                        0 0 30px rgba(255, 20, 147, 0.5),
                        0 0 60px rgba(255, 20, 147, 0.2),
                        0 8px 24px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.18);
                }

                .login-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .login-button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /* ── Footer ── */
                .login-footer {
                    margin-top: 2.5rem;
                    text-align: center;
                    z-index: 1;
                }

                .footer-text {
                    color: #555;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    margin-bottom: 0.35rem;
                }

                .footer-phone {
                    color: rgba(255,20,147,0.7);
                    font-size: 0.9rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                /* ── Responsive — tablet ── */
                @media (max-width: 768px) {
                    .login-container { padding: 1.75rem 1.25rem; }
                    .login-form { padding: 2.25rem 1.75rem; border-radius: 18px; }
                    .logo-container { width: 90px; height: 90px; }
                    .logo-icon { width: 50px; height: 50px; }
                    .logo-bar { width: 70px; }
                    .logo-weights { width: 108px; }
                    .weight-left, .weight-right { width: 22px; height: 36px; }
                }

                /* ── Responsive — móvil ── */
                @media (max-width: 480px) {
                    .login-container { padding: 1.5rem 1rem; justify-content: flex-start; padding-top: 2rem; }
                    .login-header { margin-bottom: 1.75rem; }
                    .logo-container { width: 80px; height: 80px; margin-bottom: 1.25rem; }
                    .logo-icon { width: 44px; height: 44px; }
                    .logo-bar { width: 62px; height: 5px; }
                    .logo-weights { width: 96px; }
                    .weight-left, .weight-right { width: 20px; height: 32px; }
                    .brand-name { letter-spacing: 4px; }
                    .brand-subtitle { font-size: 0.6rem; letter-spacing: 2px; }
                    .login-form {
                        padding: 2rem 1.25rem;
                        border-radius: 16px;
                        max-width: 100%;
                    }
                    .form-title { font-size: 1.15rem; letter-spacing: 2px; margin-bottom: 1.5rem; }
                    .form-group { margin-bottom: 1.1rem; }
                    .form-input { padding: 0.8rem 0.875rem; font-size: 0.9rem; }
                    .form-group-checkbox { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
                    .login-button { padding: 0.875rem; font-size: 0.875rem; letter-spacing: 1.5px; }
                    .login-footer { margin-top: 1.75rem; }
                    .footer-text { font-size: 0.72rem; letter-spacing: 1.5px; }
                    .footer-phone { font-size: 0.82rem; }
                }

                /* ── Responsive — pantallas muy pequeñas ── */
                @media (max-width: 360px) {
                    .login-container { padding: 1.25rem 0.875rem; }
                    .logo-container { width: 70px; height: 70px; }
                    .logo-icon { width: 38px; height: 38px; }
                    .logo-weights { width: 86px; }
                    .weight-left, .weight-right { width: 18px; height: 28px; }
                    .login-form { padding: 1.75rem 1rem; }
                    .form-title { font-size: 1rem; }
                    .brand-subtitle { font-size: 0.55rem; letter-spacing: 1.5px; }
                }
            `}</style>
        </GuestLayout>
    );
}

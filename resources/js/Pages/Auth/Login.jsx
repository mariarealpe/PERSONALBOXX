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
                    <div className="status-message">
                        {status}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={submit} className="login-form">
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

                    {/* Botón de login */}
                    <PrimaryButton className="login-button" disabled={processing}>
                        {processing ? 'INICIANDO...' : 'ENTRAR'}
                    </PrimaryButton>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p className="footer-text">ARMENIA, QUINDÍO</p>
                    <p className="footer-phone">📱 3102973508</p>
                </div>
            </div>

            <style jsx>{`
                * {
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
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .neon-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background:
                        radial-gradient(circle at 20% 50%, rgba(255, 20, 147, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 20%, rgba(255, 20, 147, 0.08) 0%, transparent 50%);
                    animation: glow-pulse 8s ease-in-out infinite;
                    pointer-events: none;
                }

                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    z-index: 1;
                }

                .logo-container {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-icon {
                    width: 60px;
                    height: 60px;
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
                        0 0 20px rgba(255, 20, 147, 0.5),
                        inset 0 2px 4px rgba(255, 255, 255, 0.2);
                    position: relative;
                }

                .weight-left::before, .weight-right::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.3);
                }

                .weight-left {
                    transform: rotate(-10deg);
                }

                .weight-right {
                    transform: rotate(10deg);
                }

                .brand-name {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #FF1493;
                    text-transform: uppercase;
                    letter-spacing: 8px;
                    margin: 0 0 0.5rem 0;
                    text-shadow:
                        0 0 10px #FF1493,
                        0 0 20px #FF1493,
                        0 0 30px #FF1493,
                        0 0 40px #FF1493;
                    animation: neon-flicker 3s ease-in-out infinite alternate;
                }

                @keyframes neon-flicker {
                    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
                        text-shadow:
                            0 0 10px #FF1493,
                            0 0 20px #FF1493,
                            0 0 30px #FF1493,
                            0 0 40px #FF1493;
                    }
                    20%, 24%, 55% {
                        text-shadow: none;
                    }
                }

                .brand-subtitle {
                    font-size: 0.75rem;
                    color: #999;
                    letter-spacing: 4px;
                    font-weight: 600;
                }

                .status-message {
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid #22c55e;
                    color: #22c55e;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    font-size: 0.875rem;
                    z-index: 1;
                    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
                }

                .login-form {
                    background: rgba(10, 10, 10, 0.95);
                    backdrop-filter: blur(10px);
                    border: 2px solid #FF1493;
                    padding: 3rem 2.5rem;
                    border-radius: 12px;
                    box-shadow:
                        0 0 20px rgba(255, 20, 147, 0.5),
                        0 0 40px rgba(255, 20, 147, 0.3),
                        inset 0 0 60px rgba(255, 20, 147, 0.05);
                    width: 100%;
                    max-width: 450px;
                    z-index: 1;
                    position: relative;
                }

                .login-form::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #FF1493, transparent);
                    box-shadow: 0 0 10px #FF1493;
                }

                .form-title {
                    color: #FF1493;
                    font-size: 1.5rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 2rem;
                    letter-spacing: 3px;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    color: #FF1493;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .form-input {
                    width: 100%;
                    padding: 1rem;
                    background: #000000;
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow:
                        0 0 10px rgba(255, 20, 147, 0.5),
                        0 0 20px rgba(255, 20, 147, 0.3);
                    background: #0a0a0a;
                }

                .form-input::placeholder {
                    color: #555;
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.5rem;
                    text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
                }

                .form-group-checkbox {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .checkbox-text {
                    color: #999;
                    font-size: 0.875rem;
                }

                .forgot-password-link {
                    color: #FF1493;
                    font-size: 0.875rem;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-weight: 600;
                }

                .forgot-password-link:hover {
                    color: #FF69B4;
                    text-shadow: 0 0 5px rgba(255, 20, 147, 0.5);
                }

                .login-button {
                    width: 100%;
                    padding: 1.125rem;
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow:
                        0 4px 15px rgba(255, 20, 147, 0.4),
                        0 0 20px rgba(255, 20, 147, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .login-button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .login-button:hover:not(:disabled)::before {
                    width: 300px;
                    height: 300px;
                }

                .login-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow:
                        0 6px 25px rgba(255, 20, 147, 0.6),
                        0 0 30px rgba(255, 20, 147, 0.4);
                }

                .login-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .login-footer {
                    margin-top: 3rem;
                    text-align: center;
                    z-index: 1;
                }

                .footer-text {
                    color: #666;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    margin-bottom: 0.5rem;
                }

                .footer-phone {
                    color: #FF1493;
                    font-size: 1rem;
                    font-weight: 700;
                    text-shadow: 0 0 5px rgba(255, 20, 147, 0.5);
                }

                @media (max-width: 640px) {
                    .login-form {
                        padding: 2rem 1.5rem;
                    }

                    .brand-name {
                        font-size: 2.5rem;
                        letter-spacing: 4px;
                    }

                    .brand-subtitle {
                        font-size: 0.65rem;
                    }

                    .form-group-checkbox {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </GuestLayout>
    );
}

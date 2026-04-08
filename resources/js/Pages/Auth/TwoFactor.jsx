import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

export default function TwoFactor() {
    const { data, setData, post, processing, errors } = useForm({ otp: '' });

    useEffect(() => {
        document.getElementById('otp-input')?.focus();
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('2fa.verify'));
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) setData('otp', value);
    };

    return (
        <GuestLayout>
            <div className="tf-container">
                {/* Fondo neon */}
                <div className="tf-bg"></div>
                <div className="tf-grid"></div>

                {/* Partículas */}
                <div className="particles">
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                    <div className="particle p4"></div>
                </div>

                {/* Logo + título */}
                <div className="tf-header">
                    {/* Ícono candado SVG con anillos animados */}
                    <div className="lock-wrap">
                        <div className="lock-ring r1"></div>
                        <div className="lock-ring r2"></div>
                        <div className="lock-core">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                                 className="lock-icon">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                    </div>

                    <h1 className="tf-title">VERIFICACIÓN 2FA</h1>
                    <p className="tf-subtitle">Ingresa el código de 6 dígitos enviado a tu correo</p>
                </div>

                {/* Card glassmorphism */}
                <form onSubmit={submit} className="tf-card">
                    <div className="card-shine"></div>

                    {/* Input OTP */}
                    <div className="input-wrap">
                        <input
                            id="otp-input"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="6"
                            value={data.otp}
                            onChange={handleOtpChange}
                            className="otp-input"
                            placeholder="• • • • • •"
                            autoComplete="off"
                            aria-label="Código de verificación"
                        />
                        {/* Puntos de progreso */}
                        <div className="otp-progress">
                            {[0,1,2,3,4,5].map(i => (
                                <div
                                    key={i}
                                    className={`otp-dot ${i < data.otp.length ? 'filled' : ''}`}
                                ></div>
                            ))}
                        </div>
                        <InputError message={errors.otp} className="otp-error" />
                    </div>

                    {/* Botón — glassmorphism + neon */}
                    <button
                        type="submit"
                        disabled={processing || data.otp.length !== 6}
                        className="verify-btn"
                    >
                        <span className="btn-shine"></span>
                        {processing ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
                    </button>

                    {/* Hint */}
                    <div className="hint-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.8" strokeLinecap="round" width="14" height="14">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p className="hint-text">El código expira en 5 minutos</p>
                    </div>
                </form>

                {/* Footer */}
                <div className="tf-footer">
                    <p className="footer-text">ARMENIA, QUINDÍO</p>
                </div>
            </div>

            <style>{`
                *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

                .tf-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    padding: 2rem 1.25rem;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Figtree', 'Segoe UI', system-ui, sans-serif;
                    gap: 2rem;
                }

                /* ── Fondo ── */
                .tf-bg {
                    position: fixed;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 70% 60% at 25% 50%, rgba(255,20,147,0.18) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 65% at 80% 75%, rgba(255,20,147,0.11) 0%, transparent 55%),
                        radial-gradient(ellipse 40% 35% at 55% 10%, rgba(255,20,147,0.07) 0%, transparent 55%);
                    animation: bgPulse 10s ease-in-out infinite alternate;
                    pointer-events: none;
                    z-index: 0;
                }
                @keyframes bgPulse { 0% { opacity: 0.55; } 100% { opacity: 1; } }

                .tf-grid {
                    position: fixed;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,20,147,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,20,147,0.03) 1px, transparent 1px);
                    background-size: 60px 60px;
                    pointer-events: none;
                    z-index: 0;
                }

                /* ── Partículas ── */
                .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
                .particle {
                    position: absolute;
                    width: 3px; height: 3px;
                    border-radius: 50%;
                    background: #FF1493;
                    animation: floatUp 9s ease-in-out infinite;
                    box-shadow: 0 0 6px #FF1493, 0 0 12px #FF1493;
                }
                .p1 { left: 10%;  animation-delay: 0s;   animation-duration: 9s; }
                .p2 { left: 35%;  animation-delay: 2.5s; animation-duration: 7s; }
                .p3 { left: 68%;  animation-delay: 1s;   animation-duration: 11s; }
                .p4 { left: 88%;  animation-delay: 3.8s; animation-duration: 8s; }
                @keyframes floatUp {
                    0%   { transform: translateY(110vh); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-10vh); opacity: 0; }
                }

                /* ── Header / Logo ── */
                .tf-header {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.875rem;
                    text-align: center;
                }

                .lock-wrap {
                    position: relative;
                    width: 110px; height: 110px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .lock-ring {
                    position: absolute;
                    border-radius: 50%;
                    animation: ringPulse 3s ease-in-out infinite;
                }
                .r1 { width: 110px; height: 110px; border: 1px solid rgba(255,20,147,0.18); animation-delay: 0s; }
                .r2 { width: 78px;  height: 78px;  border: 1px solid rgba(255,20,147,0.35); animation-delay: 0.6s; }

                @keyframes ringPulse {
                    0%, 100% { transform: scale(1);    opacity: 0.7; }
                    50%       { transform: scale(1.08); opacity: 1; }
                }

                .lock-core {
                    position: relative;
                    z-index: 2;
                    width: 52px; height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: lockPulse 2.5s ease-in-out infinite;
                }
                @keyframes lockPulse {
                    0%, 100% { transform: scale(1); }
                    50%       { transform: scale(1.08); }
                }

                .lock-icon {
                    width: 52px; height: 52px;
                    color: #FF1493;
                    filter: drop-shadow(0 0 16px #FF1493) drop-shadow(0 0 32px rgba(255,20,147,0.5));
                }

                .tf-title {
                    font-size: clamp(1.5rem, 5vw, 2rem);
                    font-weight: 900;
                    color: #FF1493;
                    letter-spacing: clamp(3px, 1.5vw, 6px);
                    text-shadow: 0 0 16px rgba(255,20,147,0.55);
                    animation: neonFlicker 4s ease-in-out infinite alternate;
                }
                @keyframes neonFlicker {
                    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
                        text-shadow: 0 0 16px rgba(255,20,147,0.55), 0 0 32px rgba(255,20,147,0.25);
                    }
                    20%, 24%, 55% { text-shadow: none; opacity: 0.9; }
                }

                .tf-subtitle {
                    font-size: 0.8rem;
                    color: #777;
                    letter-spacing: 0.5px;
                    max-width: 280px;
                    line-height: 1.5;
                }

                /* ── Card — glassmorphism ── */
                .tf-card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 420px;
                    padding: 2.5rem 2rem;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    overflow: hidden;

                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-top: 1px solid rgba(255, 255, 255, 0.17);

                    box-shadow:
                        0 0 0 1px rgba(255, 20, 147, 0.1),
                        0 0 40px rgba(255, 20, 147, 0.15),
                        0 0 80px rgba(255, 20, 147, 0.05),
                        0 16px 48px rgba(0, 0, 0, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                /* Brillo superior cristal */
                .card-shine {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255,255,255,0.14) 25%,
                        rgba(255,20,147,0.65) 50%,
                        rgba(255,255,255,0.14) 75%,
                        transparent 100%
                    );
                    box-shadow: 0 0 10px rgba(255,20,147,0.4);
                    pointer-events: none;
                }

                /* ── OTP Input ── */
                .input-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 0.875rem;
                }

                .otp-input {
                    width: 100%;
                    padding: 1.25rem 1rem;
                    background: rgba(0, 0, 0, 0.45);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-bottom: 1px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    color: #FF1493;
                    font-size: clamp(1.6rem, 6vw, 2.2rem);
                    font-weight: 900;
                    text-align: center;
                    letter-spacing: clamp(6px, 3vw, 12px);
                    transition: all 0.3s ease;
                    font-family: 'Courier New', monospace;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
                }

                .otp-input:focus {
                    outline: none;
                    border-color: rgba(255,20,147,0.6);
                    border-bottom-color: #FF1493;
                    background: rgba(0, 0, 0, 0.6);
                    box-shadow:
                        0 0 0 1px rgba(255,20,147,0.18),
                        0 0 20px rgba(255,20,147,0.2),
                        inset 0 1px 0 rgba(255,255,255,0.05);
                }
                .otp-input::placeholder { color: rgba(255,20,147,0.2); }

                /* Puntos de progreso */
                .otp-progress {
                    display: flex;
                    justify-content: center;
                    gap: 0.6rem;
                }
                .otp-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,20,147,0.3);
                    background: transparent;
                    transition: all 0.2s ease;
                }
                .otp-dot.filled {
                    background: #FF1493;
                    border-color: #FF1493;
                    box-shadow: 0 0 8px rgba(255,20,147,0.7), 0 0 16px rgba(255,20,147,0.3);
                }

                .otp-error {
                    color: #ef4444;
                    font-size: 0.75rem;
                    text-align: center;
                    text-shadow: 0 0 5px rgba(239,68,68,0.4);
                }

                /* ── Botón — glassmorphism + neon ── */
                .verify-btn {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 0.92rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.35s ease;
                    position: relative;
                    overflow: hidden;

                    background: rgba(255, 20, 147, 0.14);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.11);
                    border-top: 1px solid rgba(255, 255, 255, 0.22);
                    color: #FF1493;

                    box-shadow:
                        0 0 20px rgba(255,20,147,0.22),
                        0 0 40px rgba(255,20,147,0.07),
                        inset 0 1px 0 rgba(255,255,255,0.12),
                        inset 0 -1px 0 rgba(255,20,147,0.12);
                }

                /* Shimmer */
                .btn-shine {
                    position: absolute;
                    top: 0; left: -100%;
                    width: 60%; height: 100%;
                    background: linear-gradient(
                        120deg,
                        transparent 0%,
                        rgba(255,255,255,0.07) 50%,
                        transparent 100%
                    );
                    transition: left 0.55s ease;
                    pointer-events: none;
                }
                .verify-btn:hover:not(:disabled) .btn-shine { left: 160%; }

                .verify-btn:hover:not(:disabled) {
                    background: rgba(255,20,147,0.26);
                    border-color: rgba(255,255,255,0.18);
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow:
                        0 0 30px rgba(255,20,147,0.48),
                        0 0 60px rgba(255,20,147,0.18),
                        0 8px 24px rgba(0,0,0,0.4),
                        inset 0 1px 0 rgba(255,255,255,0.16);
                }
                .verify-btn:active:not(:disabled) { transform: translateY(0); }
                .verify-btn:disabled { opacity: 0.35; cursor: not-allowed; }

                /* ── Hint ── */
                .hint-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    color: #555;
                }
                .hint-row svg { flex-shrink: 0; }
                .hint-text { font-size: 0.78rem; letter-spacing: 0.3px; }

                /* ── Footer ── */
                .tf-footer { position: relative; z-index: 1; }
                .footer-text {
                    color: rgba(255,20,147,0.4);
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 2.5px;
                    text-align: center;
                    text-transform: uppercase;
                }

                /* ── Responsive ── */
                @media (max-width: 480px) {
                    .tf-container { padding: 1.5rem 1rem; gap: 1.5rem; }
                    .lock-wrap { width: 90px; height: 90px; }
                    .r1 { width: 90px; height: 90px; }
                    .r2 { width: 64px; height: 64px; }
                    .lock-core { width: 42px; height: 42px; }
                    .lock-icon { width: 42px; height: 42px; }
                    .tf-subtitle { font-size: 0.74rem; max-width: 240px; }
                    .tf-card { padding: 2rem 1.25rem; border-radius: 16px; }
                    .otp-input { padding: 1rem 0.75rem; border-radius: 10px; }
                    .verify-btn { padding: 0.875rem; font-size: 0.85rem; }
                }

                @media (max-width: 360px) {
                    .tf-container { padding: 1.25rem 0.875rem; gap: 1.25rem; }
                    .lock-wrap { width: 76px; height: 76px; }
                    .r1 { width: 76px; height: 76px; }
                    .r2 { width: 54px; height: 54px; }
                    .lock-core { width: 36px; height: 36px; }
                    .lock-icon { width: 36px; height: 36px; }
                    .tf-card { padding: 1.75rem 1rem; }
                    .otp-progress { gap: 0.45rem; }
                    .otp-dot { width: 7px; height: 7px; }
                }
            `}</style>
        </GuestLayout>
    );
}

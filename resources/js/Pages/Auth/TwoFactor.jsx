import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

export default function TwoFactor() {
    const { data, setData, post, processing, errors } = useForm({
        otp: ''
    });

    useEffect(() => {
        // Auto-focus en el input
        document.getElementById('otp-input')?.focus();
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('2fa.verify'));
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo números
        if (value.length <= 6) {
            setData('otp', value);
        }
    };

    return (
        <GuestLayout>
            <div className="verification-container">
                <div className="neon-background"></div>

                <div className="verification-card">
                    {/* Header */}
                    <div className="header">
                        <div className="icon">🔐</div>
                        <h1 className="title">VERIFICACIÓN 2FA</h1>
                        <p className="subtitle">Ingresa el código de 6 dígitos enviado a tu correo</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="form">
                        <div className="input-group">
                            <input
                                id="otp-input"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="6"
                                value={data.otp}
                                onChange={handleOtpChange}
                                className="otp-input"
                                placeholder="000000"
                                autoComplete="off"
                            />
                            <InputError message={errors.otp} className="error" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.otp.length !== 6}
                            className="verify-button"
                        >
                            {processing ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
                        </button>

                        <p className="help-text">
                            ⏱️ El código expira en 5 minutos
                        </p>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .verification-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000000;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .neon-background {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 30% 50%, rgba(255, 20, 147, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, rgba(255, 20, 147, 0.1) 0%, transparent 50%);
                    animation: glow-pulse 8s ease-in-out infinite;
                    pointer-events: none;
                }

                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                .verification-card {
                    background: rgba(10, 10, 10, 0.95);
                    backdrop-filter: blur(10px);
                    border: 2px solid #FF1493;
                    padding: 3rem;
                    border-radius: 12px;
                    box-shadow:
                        0 0 20px rgba(255, 20, 147, 0.5),
                        0 0 40px rgba(255, 20, 147, 0.3),
                        inset 0 0 60px rgba(255, 20, 147, 0.05);
                    width: 100%;
                    max-width: 500px;
                    z-index: 1;
                    position: relative;
                }

                .verification-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #FF1493, transparent);
                    box-shadow: 0 0 10px #FF1493;
                }

                .header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    filter: drop-shadow(0 0 20px #FF1493);
                    animation: pulse-icon 2s ease-in-out infinite;
                }

                @keyframes pulse-icon {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .title {
                    color: #FF1493;
                    font-size: 2rem;
                    font-weight: 900;
                    letter-spacing: 4px;
                    margin: 0 0 1rem 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                }

                .subtitle {
                    color: #999;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .otp-input {
                    width: 100%;
                    padding: 1.5rem;
                    background: #000000;
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    color: #FF1493;
                    font-size: 2rem;
                    font-weight: 900;
                    text-align: center;
                    letter-spacing: 8px;
                    transition: all 0.3s ease;
                    font-family: 'Courier New', monospace;
                }

                .otp-input:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow:
                        0 0 10px rgba(255, 20, 147, 0.5),
                        0 0 20px rgba(255, 20, 147, 0.3);
                    background: #0a0a0a;
                }

                .otp-input::placeholder {
                    color: #333;
                    opacity: 0.5;
                }

                .error {
                    color: #ef4444;
                    font-size: 0.875rem;
                    text-align: center;
                    text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
                }

                .verify-button {
                    width: 100%;
                    padding: 1.25rem;
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
                }

                .verify-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow:
                        0 6px 25px rgba(255, 20, 147, 0.6),
                        0 0 30px rgba(255, 20, 147, 0.4);
                }

                .verify-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .help-text {
                    color: #666;
                    font-size: 0.875rem;
                    text-align: center;
                    margin: 0;
                }

                @media (max-width: 640px) {
                    .verification-card {
                        padding: 2rem 1.5rem;
                    }

                    .title {
                        font-size: 1.5rem;
                    }

                    .otp-input {
                        font-size: 1.5rem;
                        letter-spacing: 4px;
                    }
                }
            `}</style>
        </GuestLayout>
    );
}

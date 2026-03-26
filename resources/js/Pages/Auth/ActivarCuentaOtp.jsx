import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ActivarCuentaOtp({ email, intentos_restantes = 3 }) {
    const { data, setData, post, processing, errors } = useForm({ otp: '' });
    const C = '#FF1493';

    const submit = (e) => {
        e.preventDefault();
        post(route('activar-cuenta.verificar-otp.post'));
    };

    const handleChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 6) setData('otp', val);
    };

    // Color del indicador según intentos restantes
    const intentosColor = intentos_restantes >= 3 ? '#22c55e'
        : intentos_restantes === 2 ? '#eab308'
            : '#ef4444';

    return (
        <GuestLayout>
            <Head title="Verificar código — Personal Box" />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

                <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(255,20,147,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />

                <div style={{ background: 'rgba(10,10,10,0.97)', border: `2px solid ${C}`, borderRadius: 14, padding: '3rem 2.5rem', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 0 50px rgba(255,20,147,0.35)', position: 'relative', zIndex: 1 }}>

                    <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem', filter: `drop-shadow(0 0 16px ${C})` }}>🔐</div>

                    <h1 style={{ color: C, fontWeight: 900, fontSize: '1.5rem', margin: '0 0 0.5rem', letterSpacing: 3, textShadow: `0 0 10px rgba(255,20,147,0.5)` }}>
                        VERIFICACIÓN
                    </h1>

                    <p style={{ color: '#999', fontSize: '0.875rem', margin: '0 0 0.5rem', lineHeight: 1.6 }}>
                        Ingresa el código de 6 dígitos enviado a:
                    </p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 1.5rem' }}>
                        {email}
                    </p>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            maxLength={6} value={data.otp} onChange={handleChange}
                            autoFocus autoComplete="off" placeholder="000000"
                            style={{
                                width: '100%', padding: '1.25rem',
                                background: '#000',
                                border: `2px solid ${data.otp.length === 6 ? C : 'rgba(255,20,147,0.3)'}`,
                                borderRadius: 8, color: C,
                                fontSize: '2.25rem', fontWeight: 900,
                                textAlign: 'center', letterSpacing: '10px',
                                outline: 'none', boxSizing: 'border-box',
                                fontFamily: 'monospace',
                                transition: 'border-color 0.2s',
                                boxShadow: data.otp.length === 6 ? `0 0 12px rgba(255,20,147,0.3)` : 'none',
                            }}
                        />

                        {/* Indicador de puntos */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            {[0,1,2,3,4,5].map(i => (
                                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < data.otp.length ? C : 'rgba(255,20,147,0.2)', transition: 'background 0.15s' }} />
                            ))}
                        </div>

                        {/* Error */}
                        {errors.otp && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem' }}>
                                <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{errors.otp}</p>
                            </div>
                        )}

                        {/* ── RF-21: Indicador de intentos restantes ───────── */}
                        {intentos_restantes < 3 && (
                            <div style={{ background: `${intentosColor}15`, border: `1px solid ${intentosColor}55`, borderRadius: 8, padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem' }}>⚠️</span>
                                <p style={{ color: intentosColor, fontSize: '0.82rem', margin: 0, fontWeight: 600 }}>
                                    {intentos_restantes === 1
                                        ? '¡Último intento! Si falla, deberás contactar al administrador.'
                                        : `Te quedan ${intentos_restantes} intentos.`}
                                </p>
                            </div>
                        )}
                        {/* ─────────────────────────────────────────────────── */}

                        <button
                            type="submit"
                            disabled={processing || data.otp.length !== 6}
                            style={{
                                background: `linear-gradient(135deg,${C},#C71585)`,
                                color: '#fff', border: 'none', borderRadius: 8,
                                padding: '1rem', fontWeight: 900, fontSize: '1rem',
                                cursor: (processing || data.otp.length !== 6) ? 'not-allowed' : 'pointer',
                                opacity: (processing || data.otp.length !== 6) ? 0.5 : 1,
                                letterSpacing: 1,
                                boxShadow: `0 4px 16px rgba(255,20,147,0.4)`,
                                transition: 'all 0.2s',
                            }}
                        >
                            {processing ? 'Verificando...' : '✅ Activar mi cuenta'}
                        </button>
                    </form>

                    <p style={{ color: '#444', fontSize: '0.75rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
                        ⏰ El código expira en 5 minutos.<br />
                        Si no lo recibiste, contacta al administrador.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}

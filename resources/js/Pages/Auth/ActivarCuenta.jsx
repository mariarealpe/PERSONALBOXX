import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ActivarCuenta({ token, email, error }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token ?? '',
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('activar-cuenta.completar'));
    };

    const C   = '#FF1493';
    const inp = {
        width: '100%', padding: '0.875rem 1rem',
        background: '#000', border: '2px solid rgba(255,20,147,0.3)',
        borderRadius: 8, color: '#fff', fontSize: '0.9rem',
        boxSizing: 'border-box', outline: 'none',
        transition: 'border-color 0.2s',
    };
    const lbl = {
        display: 'block', color: C, fontSize: '0.7rem',
        fontWeight: 700, marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: 1,
    };

    // ── Pantalla de error (token inválido o expirado) ─────────────────────────
    if (error) {
        return (
            <GuestLayout>
                <Head title="Activar cuenta — Error" />
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem' }}>
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid #ef4444', borderRadius: 12, padding: '3rem', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 0 40px rgba(239,68,68,0.3)' }}>
                        <span style={{ fontSize: '3.5rem' }}>❌</span>
                        <h2 style={{ color: '#ef4444', fontWeight: 900, margin: '1rem 0 0.75rem', fontSize: '1.5rem', letterSpacing: 2 }}>
                            ENLACE INVÁLIDO
                        </h2>
                        <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.75rem' }}>
                            {error}
                        </p>
                        <a href="/login" style={{ display: 'inline-block', background: C, color: '#fff', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                            ← Ir al Login
                        </a>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    // ── Formulario de activación ─────────────────────────────────────────────
    return (
        <GuestLayout>
            <Head title="Activar tu cuenta — Personal Box" />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

                {/* Fondo neón sutil */}
                <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(255,20,147,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />

                <div style={{ background: 'rgba(10,10,10,0.97)', border: `2px solid ${C}`, borderRadius: 14, padding: '2.75rem', maxWidth: 500, width: '100%', boxShadow: '0 0 50px rgba(255,20,147,0.35)', position: 'relative', zIndex: 1 }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: 56, height: 56, background: `linear-gradient(135deg,${C},#C71585)`, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: `0 0 20px rgba(255,20,147,0.5)` }}>
                            <span style={{ fontSize: '1.6rem' }}>🥊</span>
                        </div>
                        <h1 style={{ color: C, fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.25rem', letterSpacing: 3, textShadow: `0 0 10px rgba(255,20,147,0.5)` }}>
                            ACTIVAR CUENTA
                        </h1>
                        <p style={{ color: '#666', fontSize: '0.82rem', margin: 0 }}>Personal Box Armenia</p>
                    </div>

                    {/* Email prellenado — solo lectura */}
                    <div style={{ background: 'rgba(255,20,147,0.06)', border: '1px solid rgba(255,20,147,0.2)', borderRadius: 8, padding: '0.875rem 1.1rem', marginBottom: '1.75rem' }}>
                        <p style={{ color: '#777', fontSize: '0.68rem', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 1 }}>Correo electrónico (no editable)</p>
                        <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{email}</p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                        <div>
                            <label style={lbl}>Nombre de usuario *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                                autoFocus
                                placeholder="¿Cómo te llamamos?"
                                style={inp}
                            />
                            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.name}</p>}
                        </div>

                        <div>
                            <label style={lbl}>Contraseña * <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>(mínimo 8 caracteres)</span></label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required
                                placeholder="••••••••"
                                style={inp}
                            />
                            {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</p>}
                        </div>

                        <div>
                            <label style={lbl}>Confirmar contraseña *</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required
                                placeholder="••••••••"
                                style={inp}
                            />
                            {errors.password_confirmation && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password_confirmation}</p>}
                        </div>

                        {errors.token && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem' }}>
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{errors.token}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            style={{ background: `linear-gradient(135deg,${C},#C71585)`, color: '#fff', border: 'none', borderRadius: 8, padding: '1rem', fontWeight: 900, fontSize: '1rem', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1, marginTop: '0.25rem', letterSpacing: 1, boxShadow: `0 4px 16px rgba(255,20,147,0.4)`, transition: 'all 0.2s' }}
                        >
                            {processing ? 'Procesando...' : 'Continuar →'}
                        </button>
                    </form>

                    <p style={{ color: '#444', fontSize: '0.75rem', textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.5 }}>
                        Recibirás un código de verificación en tu correo para finalizar la activación.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}

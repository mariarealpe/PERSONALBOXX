import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar contraseña" />

            <div className="fp-container">
                <div className="fp-bg"></div>
                <div className="fp-grid"></div>

                <div className="fp-header">
                    <h1 className="fp-title">RECUPERAR CONTRASEÑA</h1>
                    <p className="fp-subtitle">Te enviaremos un enlace para restablecer tu contraseña.</p>
                </div>

                {status && <div className="fp-status">{status}</div>}

                <form onSubmit={submit} className="fp-card">
                    <div className="card-shine"></div>

                    <label htmlFor="email" className="fp-label">CORREO ELECTRÓNICO</label>
                    <input
                        id="email"
                        type="email"
                        className="fp-input"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="tu@email.com"
                        autoFocus
                    />
                    <InputError message={errors.email} className="fp-error" />

                    <button type="submit" className="fp-btn" disabled={processing}>
                        {processing ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
                    </button>

                    <div className="fp-actions">
                        <Link href={route('login')} className="fp-link">Volver al login</Link>
                    </div>
                </form>
            </div>

            <style>{`
                *{box-sizing:border-box}
                .fp-container{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#000;padding:1.5rem;position:relative;overflow:hidden}
                .fp-bg{position:fixed;inset:0;background:radial-gradient(ellipse 70% 60% at 25% 45%, rgba(255,20,147,.18) 0%, transparent 55%),radial-gradient(ellipse 50% 65% at 80% 75%, rgba(255,20,147,.1) 0%, transparent 55%);z-index:0}
                .fp-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(255,20,147,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,20,147,.03) 1px,transparent 1px);background-size:60px 60px;z-index:0}
                .fp-header,.fp-card,.fp-status{position:relative;z-index:1}
                .fp-title{color:#FF1493;font-size:clamp(1.4rem,5vw,2rem);font-weight:900;letter-spacing:3px;text-align:center;text-shadow:0 0 14px rgba(255,20,147,.45)}
                .fp-subtitle{color:#777;text-align:center;font-size:.82rem;margin-top:.45rem}
                .fp-status{margin:1rem 0;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);color:#22c55e;padding:.75rem 1rem;border-radius:10px;max-width:420px;width:100%;text-align:center;font-size:.85rem}
                .fp-card{margin-top:1rem;width:100%;max-width:420px;padding:2rem 1.5rem;border-radius:18px;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);box-shadow:0 0 30px rgba(255,20,147,.14),0 12px 32px rgba(0,0,0,.55);position:relative}
                .card-shine{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(255,20,147,.65),transparent)}
                .fp-label{display:block;color:rgba(255,20,147,.88);font-size:.7rem;font-weight:700;letter-spacing:2px;margin-bottom:.5rem}
                .fp-input{width:100%;padding:.9rem 1rem;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,20,147,.3);border-radius:10px;color:#fff}
                .fp-input:focus{outline:none;border-color:rgba(255,20,147,.65);box-shadow:0 0 0 1px rgba(255,20,147,.2),0 0 14px rgba(255,20,147,.2)}
                .fp-error{margin-top:.45rem;color:#ef4444;font-size:.75rem}
                .fp-btn{width:100%;margin-top:1rem;padding:.9rem;border-radius:11px;background:rgba(255,20,147,.16);border:1px solid rgba(255,255,255,.15);color:#FF1493;font-weight:900;letter-spacing:1px;cursor:pointer}
                .fp-btn:hover:not(:disabled){background:rgba(255,20,147,.28);color:#fff}
                .fp-btn:disabled{opacity:.45;cursor:not-allowed}
                .fp-actions{margin-top:.9rem;display:flex;justify-content:center}
                .fp-link{color:rgba(255,20,147,.86);font-size:.82rem;text-decoration:none;font-weight:700}
                .fp-link:hover{color:#FF1493;text-shadow:0 0 8px rgba(255,20,147,.45)}
            `}</style>
        </GuestLayout>
    );
}

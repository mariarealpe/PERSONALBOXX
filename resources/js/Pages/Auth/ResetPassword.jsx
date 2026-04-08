import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

export default function ResetPassword({ email = '', token }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title="Restablecer contraseña" />

            <div className="rp-container">
                <div className="rp-bg"></div>
                <div className="rp-grid"></div>

                <div className="rp-header">
                    <h1 className="rp-title">NUEVA CONTRASEÑA</h1>
                    <p className="rp-subtitle">
                        Ingresa y confirma tu nueva contraseña.
                    </p>
                </div>

                <form onSubmit={submit} className="rp-card">
                    <div className="card-shine"></div>

                    <input type="hidden" value={data.token} />

                    <label htmlFor="email" className="rp-label">
                        CORREO ELECTRÓNICO
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="rp-input"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="rp-error" />

                    <label htmlFor="password" className="rp-label">
                        CONTRASEÑA
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="rp-input"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="rp-error" />

                    <label
                        htmlFor="password_confirmation"
                        className="rp-label"
                    >
                        CONFIRMAR CONTRASEÑA
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        className="rp-input"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="••••••••"
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="rp-error"
                    />

                    <button
                        type="submit"
                        className="rp-btn"
                        disabled={processing}
                    >
                        {processing ? 'ACTUALIZANDO...' : 'RESTABLECER'}
                    </button>

                    <div className="rp-actions">
                        <Link
                            href={route('login')}
                            className="rp-link"
                        >
                            Volver al login
                        </Link>
                    </div>
                </form>
            </div>

            <style>{`
                *{box-sizing:border-box}
                .rp-container{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#000;padding:1.5rem;position:relative;overflow:hidden}
                .rp-bg{position:fixed;inset:0;background:radial-gradient(ellipse 70% 60% at 25% 45%, rgba(255,20,147,.18) 0%, transparent 55%),radial-gradient(ellipse 50% 65% at 80% 75%, rgba(255,20,147,.1) 0%, transparent 55%);z-index:0}
                .rp-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(255,20,147,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,20,147,.03) 1px,transparent 1px);background-size:60px 60px;z-index:0}
                .rp-header,.rp-card{position:relative;z-index:1}
                .rp-title{color:#FF1493;font-size:clamp(1.35rem,5vw,1.9rem);font-weight:900;letter-spacing:3px;text-align:center;text-shadow:0 0 14px rgba(255,20,147,.45)}
                .rp-subtitle{color:#777;text-align:center;font-size:.82rem;margin-top:.45rem}
                .rp-card{margin-top:1rem;width:100%;max-width:440px;padding:2rem 1.5rem;border-radius:18px;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);box-shadow:0 0 30px rgba(255,20,147,.14),0 12px 32px rgba(0,0,0,.55);position:relative}
                .card-shine{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(255,20,147,.65),transparent)}
                .rp-label{display:block;color:rgba(255,20,147,.88);font-size:.7rem;font-weight:700;letter-spacing:2px;margin:.8rem 0 .45rem}
                .rp-input{width:100%;padding:.9rem 1rem;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,20,147,.3);border-radius:10px;color:#fff}
                .rp-input:focus{outline:none;border-color:rgba(255,20,147,.65);box-shadow:0 0 0 1px rgba(255,20,147,.2),0 0 14px rgba(255,20,147,.2)}
                .rp-error{margin-top:.4rem;color:#ef4444;font-size:.75rem}
                .rp-btn{width:100%;margin-top:1.1rem;padding:.9rem;border-radius:11px;background:rgba(255,20,147,.16);border:1px solid rgba(255,255,255,.15);color:#FF1493;font-weight:900;letter-spacing:1px;cursor:pointer}
                .rp-btn:hover:not(:disabled){background:rgba(255,20,147,.28);color:#fff}
                .rp-btn:disabled{opacity:.45;cursor:not-allowed}
                .rp-actions{margin-top:.9rem;display:flex;justify-content:center}
                .rp-link{color:rgba(255,20,147,.86);font-size:.82rem;text-decoration:none;font-weight:700}
                .rp-link:hover{color:#FF1493;text-shadow:0 0 8px rgba(255,20,147,.45)}
            `}</style>
        </GuestLayout>
    );
}

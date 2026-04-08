import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useRef } from 'react';

const Ico = {
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
    ),
};

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className="profile-card">
            <div className="card-header">
                <span className="card-icon" aria-hidden>{Ico.lock}</span>
                <div>
                    <h2 className="card-title">Cambiar Contraseña</h2>
                    <p className="card-desc">Usa una contraseña larga y aleatoria para mayor seguridad</p>
                </div>
            </div>

            <form onSubmit={updatePassword} className="card-form">
                <div className="form-group">
                    <label className="label">Contraseña actual</label>
                    <input
                        type="password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        className={`input ${errors.current_password ? 'input-error' : ''}`}
                        autoComplete="current-password"
                    />
                    {errors.current_password && <p className="error-msg">{errors.current_password}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Nueva contraseña</label>
                    <input
                        type="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className={`input ${errors.password ? 'input-error' : ''}`}
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Confirmar nueva contraseña</label>
                    <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className={`input ${errors.password_confirmation ? 'input-error' : ''}`}
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && <p className="error-msg">{errors.password_confirmation}</p>}
                </div>

                <div className="card-footer">
                    <button type="submit" disabled={processing} className="btn-save">
                        {processing ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="saved-badge">
                            <span className="saved-icon">{Ico.check}</span>
                            Contraseña actualizada
                        </span>
                    </Transition>
                </div>
            </form>

            <style>{`
                .profile-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-top: 1px solid rgba(255,255,255,0.14);
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 0 24px rgba(255,20,147,0.08), 0 8px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
                    transition: border-color 0.3s;
                }
                .profile-card:hover { border-color: rgba(255, 20, 147, 0.35); }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.2rem 1.3rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.15);
                    background: rgba(255, 20, 147, 0.04);
                }

                .card-icon { width: 22px; height: 22px; color: #FF1493; display: inline-flex; flex-shrink: 0; }
                .card-icon svg { width: 100%; height: 100%; }

                .card-title {
                    color: #FF1493;
                    font-size: 1.1rem;
                    font-weight: 900;
                    margin: 0 0 0.2rem 0;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .card-desc { color: #666; font-size: 0.8rem; margin: 0; }

                .card-form {
                    padding: 1.15rem 1.3rem 1.3rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }

                .label {
                    color: #FF1493;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }

                .input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: #000;
                    border: 2px solid rgba(255, 20, 147, 0.25);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                .input:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow: 0 0 12px rgba(255, 20, 147, 0.25);
                }

                .input-error { border-color: #ef4444 !important; }
                .error-msg { color: #ef4444; font-size: 0.75rem; margin: 0; }

                .card-footer {
                    display: flex;
                    align-items: center;
                    gap: .75rem;
                    padding-top: .25rem;
                    flex-wrap: wrap;
                }

                .btn-save {
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    color: #000;
                    border: none;
                    padding: 0.75rem 1.75rem;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.35);
                }

                .btn-save:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.55);
                }

                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

                .saved-badge {
                    color: #22c55e;
                    font-size: 0.84rem;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: .35rem;
                }
                .saved-icon { width: 14px; height: 14px; display: inline-flex; }

                @media (max-width: 560px) {
                    .card-header { padding: 1rem; }
                    .card-form { padding: 1rem; }
                    .btn-save { width: 100%; justify-content: center; }
                }
            `}</style>
        </section>
    );
}

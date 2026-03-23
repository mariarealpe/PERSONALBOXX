import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({ password: '' });

    const confirmDeletion = () => {
        setConfirmingDeletion(true);
        // pequeño delay para que el input esté en el DOM
        setTimeout(() => passwordInput.current?.focus(), 50);
    };

    const deleteAccount = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <>
            <section className="profile-card danger-card">
                <div className="card-header">
                    <span className="card-icon">⚠️</span>
                    <div>
                        <h2 className="card-title danger-title">Eliminar Cuenta</h2>
                        <p className="card-desc">
                            Esta acción es permanente e irreversible. Todos tus datos serán borrados.
                        </p>
                    </div>
                </div>

                <div className="card-body">
                    <button onClick={confirmDeletion} className="btn-danger">
                        🗑️ Eliminar mi cuenta
                    </button>
                </div>
            </section>

            {/* Modal de confirmación */}
            {confirmingDeletion && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">¿Eliminar tu cuenta?</h2>
                            <button onClick={closeModal} className="btn-close">✕</button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-warning">
                                ⚠️ Esta acción eliminará permanentemente tu cuenta y todos tus datos.
                                No podrás recuperarlos. Ingresa tu contraseña para confirmar.
                            </p>

                            <form onSubmit={deleteAccount} className="modal-form">
                                <div className="form-group">
                                    <label className="label">Contraseña</label>
                                    <input
                                        type="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`input ${errors.password ? 'input-error' : ''}`}
                                        placeholder="Confirma tu contraseña"
                                    />
                                    {errors.password && <p className="error-msg">{errors.password}</p>}
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={closeModal} className="btn-cancel">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={processing} className="btn-confirm-delete">
                                        {processing ? 'Eliminando...' : '🗑️ Sí, eliminar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .profile-card {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.25);
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.06);
                    transition: border-color 0.3s;
                }

                .danger-card {
                    border-color: rgba(239, 68, 68, 0.25);
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.04);
                }

                .danger-card:hover {
                    border-color: rgba(239, 68, 68, 0.45);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(239, 68, 68, 0.15);
                    background: rgba(239, 68, 68, 0.04);
                }

                .card-icon { font-size: 1.75rem; flex-shrink: 0; }

                .card-title {
                    color: #FF1493;
                    font-size: 1.1rem;
                    font-weight: 900;
                    margin: 0 0 0.2rem 0;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .danger-title { color: #ef4444; }

                .card-desc { color: #666; font-size: 0.8rem; margin: 0; }

                .card-body { padding: 1.75rem; }

                .btn-danger {
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid #ef4444;
                    color: #ef4444;
                    padding: 0.75rem 1.75rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-danger:hover {
                    background: #ef4444;
                    color: #fff;
                    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
                    transform: translateY(-2px);
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal {
                    background: rgba(10, 10, 10, 0.98);
                    border: 2px solid #ef4444;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
                    overflow: hidden;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(239, 68, 68, 0.3);
                    background: rgba(239, 68, 68, 0.05);
                }

                .modal-title {
                    color: #ef4444;
                    font-size: 1.25rem;
                    font-weight: 900;
                    margin: 0;
                }

                .btn-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-close:hover { color: #ef4444; transform: rotate(90deg); }

                .modal-body { padding: 1.5rem; }

                .modal-warning {
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    border-radius: 8px;
                    padding: 1rem;
                    color: #fca5a5;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .modal-form { display: flex; flex-direction: column; gap: 1rem; }

                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }

                .label {
                    color: #ef4444;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }

                .input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: #000;
                    border: 2px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                .input:focus {
                    outline: none;
                    border-color: #ef4444;
                    box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
                }

                .input-error { border-color: #ef4444 !important; }
                .error-msg { color: #ef4444; font-size: 0.75rem; margin: 0; }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding-top: 0.5rem;
                }

                .btn-cancel {
                    background: rgba(255, 20, 147, 0.08);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    color: #FF1493;
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-cancel:hover {
                    border-color: #FF1493;
                    background: rgba(255, 20, 147, 0.15);
                }

                .btn-confirm-delete {
                    background: linear-gradient(135deg, #ef4444, #b91c1c);
                    color: #fff;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
                }

                .btn-confirm-delete:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
                }

                .btn-confirm-delete:disabled { opacity: 0.5; cursor: not-allowed; }

                @media (max-width: 480px) {
                    .modal-footer { flex-direction: column; }
                    .btn-cancel, .btn-confirm-delete { width: 100%; text-align: center; }
                }
            `}</style>
        </>
    );
}

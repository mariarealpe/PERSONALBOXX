import { Link, useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState } from 'react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, user }) {
    const [previewFoto, setPreviewFoto] = useState(user.foto_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedOk, setSavedOk] = useState(false);

    const { data, setData, errors, setError, clearErrors } = useForm({
        name: user.name,
        email: user.email,
        foto: null,
    });

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('foto', file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewFoto(reader.result);
        reader.readAsDataURL(file);
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        setSavedOk(false);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        if (data.foto) formData.append('foto', data.foto);
        formData.append('_method', 'PATCH');

        setIsSubmitting(true);
        router.post(route('profile.update'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setSavedOk(true);
                setTimeout(() => setSavedOk(false), 3000);
            },
            onError: (errs) => {
                setIsSubmitting(false);
                Object.keys(errs).forEach(k => setError(k, errs[k]));
            },
        });
    };

    return (
        <section className="profile-card">
            <div className="card-header">
                <span className="card-icon">👤</span>
                <div>
                    <h2 className="card-title">Información Personal</h2>
                    <p className="card-desc">Actualiza tu foto, nombre y correo electrónico</p>
                </div>
            </div>

            <form onSubmit={submit} className="card-form">

                {/* ── Foto de perfil ── */}
                <div className="foto-section">
                    <div className="foto-preview-wrap">
                        {previewFoto ? (
                            <img src={previewFoto} alt="Foto de perfil" className="foto-preview-img" />
                        ) : (
                            <div className="foto-placeholder">
                                <span className="foto-placeholder-letter">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="foto-ring"></div>
                    </div>

                    <div className="foto-actions">
                        <p className="foto-label">Foto de perfil</p>
                        <p className="foto-hint">JPG, PNG o WEBP · Máx. 2 MB</p>
                        <input
                            type="file"
                            id="foto-input"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFotoChange}
                            className="foto-input-hidden"
                        />
                        <label htmlFor="foto-input" className="btn-foto">
                            📷 Cambiar foto
                        </label>
                        {previewFoto && previewFoto !== user.foto_url && (
                            <span className="foto-nueva-badge">✓ Nueva foto seleccionada</span>
                        )}
                    </div>
                </div>
                {errors.foto && <p className="error-msg">{errors.foto}</p>}

                {/* ── Nombre ── */}
                <div className="form-group">
                    <label className="label">Nombre completo</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={`neon-input${errors.name ? ' input-error' : ''}`}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <p className="error-msg">{errors.name}</p>}
                </div>

                {/* ── Email ── */}
                <div className="form-group">
                    <label className="label">Correo electrónico</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={`neon-input${errors.email ? ' input-error' : ''}`}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="verify-notice">
                        <p>
                            Tu correo no está verificado.{' '}
                            <Link href={route('verification.send')} method="post" as="button" className="verify-link">
                                Reenviar verificación →
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="verify-sent">✓ Enlace de verificación enviado.</p>
                        )}
                    </div>
                )}

                <div className="card-footer">
                    <button type="submit" disabled={isSubmitting} className="btn-save">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    {savedOk && <span className="saved-badge">✓ Guardado</span>}
                </div>
            </form>

            <style>{`
                .profile-card {
                    background: rgba(10,10,10,0.95);
                    border: 2px solid rgba(255,20,147,0.25);
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 0 30px rgba(255,20,147,0.06);
                    transition: border-color 0.3s;
                }
                .profile-card:hover { border-color: rgba(255,20,147,0.45); }
                .card-header {
                    display: flex; align-items: center; gap: 1rem; padding: 1.5rem;
                    border-bottom: 1px solid rgba(255,20,147,0.15);
                    background: rgba(255,20,147,0.04);
                }
                .card-icon { font-size: 1.75rem; flex-shrink: 0; }
                .card-title {
                    color: #FF1493; font-size: 1.1rem; font-weight: 900;
                    margin: 0 0 0.2rem 0; letter-spacing: 1px; text-transform: uppercase;
                }
                .card-desc { color: #666; font-size: 0.8rem; margin: 0; }
                .card-form { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }

                /* ── Foto ── */
                .foto-section {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.25rem;
                    background: rgba(255,20,147,0.03);
                    border: 1px solid rgba(255,20,147,0.15);
                    border-radius: 10px;
                }
                .foto-preview-wrap {
                    position: relative;
                    width: 90px;
                    height: 90px;
                    flex-shrink: 0;
                }
                .foto-preview-img {
                    width: 90px; height: 90px;
                    border-radius: 50%;
                    object-fit: cover;
                    position: relative; z-index: 1;
                    border: 2px solid #FF1493;
                }
                .foto-placeholder {
                    width: 90px; height: 90px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    display: flex; align-items: center; justify-content: center;
                    position: relative; z-index: 1;
                }
                .foto-placeholder-letter {
                    font-size: 2.25rem; font-weight: 900; color: #000;
                }
                .foto-ring {
                    position: absolute; inset: -4px; border-radius: 50%;
                    border: 2px solid rgba(255,20,147,0.4);
                    animation: ringPulse 3s ease-in-out infinite;
                }
                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.08); opacity: 1; }
                }
                .foto-actions { display: flex; flex-direction: column; gap: 0.4rem; }
                .foto-label { color: #fff; font-weight: 700; font-size: 0.9rem; margin: 0; }
                .foto-hint { color: #555; font-size: 0.75rem; margin: 0; }
                .foto-input-hidden { display: none; }
                .btn-foto {
                    display: inline-block;
                    background: rgba(255,20,147,0.1);
                    border: 2px solid rgba(255,20,147,0.5);
                    color: #FF1493;
                    padding: 0.5rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: fit-content;
                }
                .btn-foto:hover {
                    background: #FF1493; color: #000;
                    box-shadow: 0 0 15px rgba(255,20,147,0.4);
                }
                .foto-nueva-badge {
                    color: #22c55e; font-size: 0.75rem; font-weight: 700;
                }

                /* ── Inputs ── */
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .label {
                    color: #FF1493; font-size: 0.7rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 1.5px;
                }
                .neon-input {
                    width: 100%; padding: 0.875rem 1rem;
                    background: #0d0d0d !important;
                    border: 2px solid rgba(255,20,147,0.35) !important;
                    border-radius: 8px;
                    color: #fff !important; font-size: 0.95rem;
                    transition: all 0.3s; box-sizing: border-box;
                    -webkit-text-fill-color: #fff !important;
                    caret-color: #FF1493; font-family: inherit;
                }
                .neon-input::placeholder { color: rgba(255,255,255,0.2) !important; }
                .neon-input:focus {
                    outline: none !important; border-color: #FF1493 !important;
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.15), inset 0 0 20px rgba(255,20,147,0.04) !important;
                }
                .neon-input:-webkit-autofill,
                .neon-input:-webkit-autofill:hover,
                .neon-input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 1000px #0d0d0d inset !important;
                    -webkit-text-fill-color: #fff !important;
                    border-color: rgba(255,20,147,0.35) !important;
                    caret-color: #FF1493;
                }
                .input-error { border-color: #ef4444 !important; }
                .error-msg { color: #ef4444; font-size: 0.75rem; margin: 0; }

                .card-footer { display: flex; align-items: center; gap: 1rem; padding-top: 0.5rem; }
                .btn-save {
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    color: #000; border: none; padding: 0.75rem 1.75rem; border-radius: 8px;
                    font-weight: 900; font-size: 0.875rem; cursor: pointer; transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(255,20,147,0.35);
                }
                .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 30px rgba(255,20,147,0.55); }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
                .saved-badge { color: #22c55e; font-size: 0.875rem; font-weight: 700; }

                .verify-notice {
                    background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.3);
                    border-radius: 8px; padding: 0.875rem 1rem; color: #fbbf24; font-size: 0.875rem;
                }
                .verify-link {
                    color: #FF1493; background: none; border: none; cursor: pointer;
                    font-weight: 700; text-decoration: underline; font-size: inherit;
                }
                .verify-sent { color: #22c55e; margin-top: 0.5rem; font-size: 0.8rem; }

                @media (max-width: 480px) {
                    .foto-section { flex-direction: column; align-items: flex-start; }
                }
            `}</style>
        </section>
    );
}

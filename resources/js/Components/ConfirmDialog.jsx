import { useEffect } from 'react';

export default function ConfirmDialog({
    open,
    title = 'Confirmar',
    message = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onClose,
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="confirm-backdrop" onClick={onClose}>
            <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-title">{title}</div>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button type="button" className="confirm-btn ghost" onClick={onClose}>{cancelText}</button>
                    <button type="button" className="confirm-btn danger" onClick={() => { onConfirm?.(); onClose?.(); }}>
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                .confirm-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.82);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1rem;
                }
                .confirm-card {
                    width: 100%;
                    max-width: 420px;
                    background: rgba(10,10,10,0.96);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-top: 1px solid rgba(255,255,255,0.18);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow:
                        0 0 30px rgba(255,20,147,0.18),
                        0 16px 40px rgba(0,0,0,0.55),
                        inset 0 1px 0 rgba(255,255,255,0.08);
                }
                .confirm-title {
                    color: #FF1493;
                    font-weight: 900;
                    font-size: 1rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin: 0 0 0.75rem;
                }
                .confirm-message { color: #bbb; margin: 0 0 1.25rem; font-size: 0.9rem; }
                .confirm-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }

                .confirm-btn {
                    padding: 0.7rem 1.1rem;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    cursor: pointer;
                    border: 1px solid transparent;
                }
                .confirm-btn.ghost {
                    background: rgba(255,20,147,0.08);
                    border-color: rgba(255,20,147,0.35);
                    color: #FF1493;
                }
                .confirm-btn.danger {
                    background: rgba(239,68,68,0.12);
                    border-color: #ef4444;
                    color: #ef4444;
                }

                @media (max-width: 480px) {
                    .confirm-card { padding: 1.25rem; }
                    .confirm-actions { flex-direction: column; }
                    .confirm-btn { width: 100%; }
                }
            `}</style>
        </div>
    );
}

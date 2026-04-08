import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function ClientesIndex({ auth, clientes, planes, filters }) {
    const [showModal,     setShowModal]     = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [confirmState, setConfirmState] = useState({
        open: false, title: '', message: '', confirmText: 'Confirmar', cancelText: 'Cancelar', onConfirm: null
    });

    // ── Para crear: solo email + nombre opcional (nuevo flujo) ───────────────
    // ── Para editar: nombre + email + contraseña opcional ────────────────────
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '', email: '', password: ''
    });

    const planForm = useForm({
        plan_id:           '',
        fecha_inicio:      new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
    });

    const openCreate = () => {
        reset();
        setEditingCliente(null);
        setShowModal(true);
    };

    const openEdit = (c) => {
        setData({ name: c.name, email: c.email, password: '' });
        setEditingCliente(c);
        setShowModal(true);
    };

    const closeModal    = () => { setShowModal(false); setEditingCliente(null); reset(); };
    const closePlanModal = () => { setShowPlanModal(false); setSelectedCliente(null); };

    const openPlanModal = (c) => {
        setSelectedCliente(c);
        planForm.reset();
        planForm.setData({ plan_id: '', fecha_inicio: new Date().toISOString().split('T')[0], fecha_vencimiento: '' });
        setShowPlanModal(true);
    };

    const sugerirFechaFin = () => {
        if (!planForm.data.fecha_inicio) return;
        const inicio = new Date(planForm.data.fecha_inicio + 'T00:00:00');
        inicio.setDate(inicio.getDate() + 30);
        planForm.setData('fecha_vencimiento', inicio.toISOString().split('T')[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCliente) {
            put(route('admin.clientes.update', editingCliente.id), { onSuccess: closeModal });
        } else {
            post(route('admin.clientes.store'), { onSuccess: closeModal });
        }
    };

    const handlePlanSubmit = (e) => {
        e.preventDefault();
        planForm.post(route('admin.clientes.plan', selectedCliente.id), { onSuccess: closePlanModal });
    };

    const openConfirm = (opts) => setConfirmState({ open: true, ...opts });
    const closeConfirm = () => setConfirmState(s => ({ ...s, open: false }));

    const handleDelete = (c) => {
        openConfirm({
            title: 'Eliminar cliente',
            message: `¿Eliminar al cliente "${c.name}"?`,
            confirmText: 'Eliminar',
            onConfirm: () => router.delete(route('admin.clientes.destroy', c.id)),
        });
    };

    const handleReenviarActivacion = (c) => {
        openConfirm({
            title: 'Reenviar activación',
            message: `¿Reenviar correo de activación a ${c.email}?`,
            confirmText: 'Reenviar',
            onConfirm: () => router.post(route('admin.clientes.reenviar-activacion', c.id)),
        });
    };

    const handleToggleActivo = (c) => {
        const msg = c.estado_cuenta === 'inactivo'
            ? `¿Activar la cuenta de "${c.name}"?`
            : `¿Desactivar la cuenta de "${c.name}"?`;
        openConfirm({
            title: 'Cambiar estado',
            message: msg,
            confirmText: c.estado_cuenta === 'inactivo' ? 'Activar' : 'Desactivar',
            onConfirm: () => router.patch(route('admin.clientes.toggle-activo', c.id)),
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.clientes.index'), { search }, { preserveState: true, replace: true });
    };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const estadoBadge = (estado) => {
        const cfg = {
            pendiente: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', label: 'Pendiente'  },
            activo:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: '#22c55e', label: 'Activo'     },
            logueado:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', label: 'Logueado'   },
            inactivo:  { color: '#6b7280', bg: 'rgba(107,114,128,0.12)',border: '#6b7280', label: 'Inactivo'   },
        };
        const e = cfg[estado] ?? cfg.activo;
        return (
            <span style={{ background: e.bg, color: e.color, border: `1px solid ${e.border}`, padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {e.label}
            </span>
        );
    };

    const inputStyle = { width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };

    // ── NeonSelect (mismo estilo que Clases) ──────────────────────────
    function NeonSelect({ value, onChange, options, placeholder = '-- Seleccionar --' }) {
        const [open, setOpen] = useState(false);
        const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
        const btnRef = useRef(null);
        const dropRef = useRef(null);

        const openDropdown = useCallback(() => {
            if (btnRef.current) {
                const rect = btnRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropH = Math.min(options.length * 44 + 8, 240);
                const showAbove = spaceBelow < dropH && rect.top > dropH;
                setDropPos({
                    top: showAbove ? rect.top - dropH - 4 : rect.bottom + 4,
                    left: rect.left,
                    width: rect.width,
                });
            }
            setOpen(o => !o);
        }, [options.length]);

        useEffect(() => {
            if (!open) return;
            const h = e => {
                if (
                    btnRef.current && !btnRef.current.contains(e.target) &&
                    dropRef.current && !dropRef.current.contains(e.target)
                ) setOpen(false);
            };
            const onScroll = () => setOpen(false);
            document.addEventListener('mousedown', h);
            document.addEventListener('scroll', onScroll, true);
            return () => {
                document.removeEventListener('mousedown', h);
                document.removeEventListener('scroll', onScroll, true);
            };
        }, [open]);

        const selected = options.find(o => String(o.value) === String(value));

        return (
            <>
                <button
                    ref={btnRef}
                    type="button"
                    onClick={openDropdown}
                    className={`nsel-btn ${open ? 'open' : ''}`}
                >
                    <span className={selected ? 'nsel-val' : 'nsel-ph'}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className={`nsel-arr ${open ? 'up' : ''}`}>›</span>
                </button>

                {open && createPortal(
                    <div
                        ref={dropRef}
                        className="nsel-drop"
                        style={{
                            position: 'fixed',
                            top: dropPos.top,
                            left: dropPos.left,
                            width: dropPos.width,
                            zIndex: 99999,
                        }}
                    >
                        <button type="button" className="nsel-opt nsel-opt-empty"
                                onClick={() => { onChange(''); setOpen(false); }}>
                            {placeholder}
                        </button>
                        {options.map(o => (
                            <button type="button" key={o.value}
                                    className={`nsel-opt ${String(value)===String(o.value) ? 'active' : ''}`}
                                    onClick={() => { onChange(o.value); setOpen(false); }}>
                                <span className="nsel-opt-lbl">{o.label}</span>
                                {String(value)===String(o.value) && <span className="nsel-chk">✓</span>}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
            </>
        );
    }

    const planOptions = planes.map(p => ({
        value: p.id,
        label: `${p.nombre} — $${new Intl.NumberFormat('es-CO').format(p.precio)}`,
    }));

    useEffect(() => {
        const hasModal = showModal || showPlanModal;
        document.body.style.overflow = hasModal ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showModal, showPlanModal]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (showPlanModal) closePlanModal();
            else if (showModal) closeModal();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showModal, showPlanModal]);

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Clientes" />
            <div className="clients-wrap">

                {/* Header */}
                <div className="clients-header">
                    <div>
                        <h1 className="clients-title">CLIENTES</h1>
                        <p className="clients-sub">Gestiona los clientes del box</p>
                    </div>
                    <button type="button" onClick={openCreate} className="btn-primary">
                        Nuevo Cliente
                    </button>
                </div>

                {/* Búsqueda */}
                <form onSubmit={handleSearch} className="clients-search">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o email..."
                        className="search-input"
                    />
                    <button type="submit" className="btn-ghost">Buscar</button>
                </form>

                {/* Tabla */}
                <div className="clients-table glass-card">
                    <div className="table-scroll">
                        <table className="table">
                            <thead className="table-head">
                            <tr>
                                {['Cliente', 'Email', 'Estado', 'Plan Activo', 'Vencimiento', 'Acciones'].map(h => (
                                    <th key={h} className="th-cell">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {clientes.data.length === 0 ? (
                                <tr><td colSpan={6} className="td-empty">No hay clientes registrados</td></tr>
                            ) : clientes.data.map(c => {
                                const pa = c.plan_activo;
                                return (
                                    <tr key={c.id} className="tr-row">
                                        {/* Nombre */}
                                        <td className="td-cell">
                                            <div className="client-cell">
                                                <div className="client-avatar">
                                                    {(c.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="client-name">{c.name || <span className="client-name-muted">Sin nombre</span>}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="td-cell td-muted">{c.email}</td>

                                        {/* Estado */}
                                        <td className="td-cell">
                                            {estadoBadge(c.estado_cuenta)}
                                        </td>

                                        {/* Plan */}
                                        <td className="td-cell">
                                            {pa ? (
                                                <span className="plan-pill">{pa.nombre}</span>
                                            ) : (
                                                <span className="td-muted">Sin plan</span>
                                            )}
                                        </td>

                                        {/* Vencimiento */}
                                        <td className="td-cell">
                                            {pa ? (() => {
                                                const dias  = Math.ceil((new Date(pa.fecha_vencimiento) - new Date()) / 86400000);
                                                const color = dias <= 5 ? '#ef4444' : dias <= 10 ? '#eab308' : '#ccc';
                                                return <span style={{ color, fontWeight: dias <= 10 ? 700 : 400 }}>{new Date(pa.fecha_vencimiento).toLocaleDateString('es-CO')}</span>;
                                            })() : <span className="td-muted">—</span>}
                                        </td>

                                        {/* Acciones */}
                                        <td className="td-cell">
                                            <div className="actions">
                                                <button type="button" onClick={() => openPlanModal(c)} title="Asignar plan" className="btn-action btn-amber">Plan</button>
                                                <button onClick={() => openEdit(c)} title="Editar" className="btn-action btn-blue">Editar</button>
                                                {c.estado_cuenta === 'pendiente' && (
                                                    <button onClick={() => handleReenviarActivacion(c)} title="Reenviar correo de activación" className="btn-action btn-orange">Reenviar</button>
                                                )}
                                                {['activo','logueado','inactivo'].includes(c.estado_cuenta) && (
                                                    <>
                                                        <div className="toggle-wrap">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleActivo(c)}
                                                                className={`toggle-switch ${c.estado_cuenta !== 'inactivo' ? 'on' : ''}`}
                                                                aria-checked={c.estado_cuenta !== 'inactivo'}
                                                                role="switch"
                                                                title={c.estado_cuenta === 'inactivo' ? 'Activar cliente' : 'Desactivar cliente'}
                                                            >
                                                                <span className="toggle-knob" />
                                                            </button>
                                                            <span className="toggle-label">
                                                                {c.estado_cuenta === 'inactivo' ? 'Inactivo' : 'Activo'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActivo(c)}
                                                            className="btn-action btn-gray"
                                                        >
                                                            {c.estado_cuenta === 'inactivo' ? 'Activar' : 'Desactivar'}
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDelete(c)} title="Eliminar" className="btn-action btn-red">Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                {clientes.links.length > 3 && (
                    <div className="pagination">
                        {clientes.links.map((link, i) => (
                            <button key={i} onClick={() => link.url && router.visit(link.url)} disabled={!link.url}
                                    className={`page-btn ${link.active ? 'active' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}

                {/* ── Modal Crear / Editar Cliente ─────────────────────────── */}
                {showModal && createPortal(
                    <div className="modal-backdrop" onClick={closeModal}>
                        <div className="modal-card" style={{ '--accent': '#FF1493' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                                </h2>
                                <button type="button" onClick={closeModal} className="modal-close">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">

                                {/* Nombre */}
                                <div>
                                    <label style={labelStyle}>
                                        Nombre del Cliente {editingCliente ? '*' : '(opcional)'}
                                    </label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required={!!editingCliente} placeholder={editingCliente ? 'Nombre completo' : 'Si ya lo conoces...'} style={inputStyle} />
                                    {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={labelStyle}>Correo Electrónico *</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required placeholder="cliente@email.com" style={inputStyle} />
                                    {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.email}</p>}
                                </div>

                                {/* Contraseña — solo al editar */}
                                {editingCliente && (
                                    <div>
                                        <label style={labelStyle}>
                                            Contraseña&nbsp;
                                            <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>(en blanco = sin cambio)</span>
                                        </label>
                                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Mínimo 8 caracteres" style={inputStyle} />
                                        {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</p>}
                                    </div>
                                )}

                                {/* Nota informativa — solo al crear */}
                                {!editingCliente && (
                                    <div className="info-box">
                                        <p className="info-text">
                                            Se enviará automáticamente un correo de activación al cliente. Él mismo creará su contraseña al activar la cuenta.
                                        </p>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button type="button" onClick={closeModal} className="btn-ghost">Cancelar</button>
                                    <button type="submit" disabled={processing} className="btn-primary">
                                        {processing ? 'Guardando...' : editingCliente ? 'Guardar' : 'Crear y Enviar Correo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

                {/* ── Modal Asignar Plan ────────────────────────────────────── */}
                {showPlanModal && createPortal(
                    <div className="modal-backdrop" onClick={closePlanModal}>
                        <div className="modal-card" style={{ '--accent': '#ffc107' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Asignar Plan — {selectedCliente?.name || selectedCliente?.email}</h2>
                                <button type="button" onClick={closePlanModal} className="modal-close">✕</button>
                            </div>
                            <form onSubmit={handlePlanSubmit} className="modal-form">
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Plan *</label>
                                    <NeonSelect
                                        value={planForm.data.plan_id}
                                        onChange={v => planForm.setData('plan_id', v)}
                                        options={planOptions}
                                        placeholder="-- Seleccionar plan --"
                                    />
                                    {planForm.errors.plan_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.plan_id}</p>}
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Fecha de Inicio *</label>
                                    <input type="date" value={planForm.data.fecha_inicio} onChange={e => planForm.setData('fecha_inicio', e.target.value)} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Fecha de Vencimiento *</label>
                                    <input type="date" value={planForm.data.fecha_vencimiento} onChange={e => planForm.setData('fecha_vencimiento', e.target.value)} required style={inputStyle} />
                                    <button type="button" onClick={sugerirFechaFin} className="link-hint">
                                        Sugerir 30 días desde el inicio
                                    </button>
                                    {planForm.errors.fecha_vencimiento && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.fecha_vencimiento}</p>}
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={closePlanModal} className="btn-ghost">Cancelar</button>
                                    <button type="submit" disabled={planForm.processing} className="btn-primary">
                                        {planForm.processing ? 'Asignando...' : 'Asignar Plan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

                <ConfirmDialog
                    open={confirmState.open}
                    title={confirmState.title}
                    message={confirmState.message}
                    confirmText={confirmState.confirmText}
                    cancelText={confirmState.cancelText}
                    onConfirm={confirmState.onConfirm}
                    onClose={closeConfirm}
                />
            </div>

            <style>{`
                .clients-wrap {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .clients-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .clients-title {
                    font-size: clamp(1.6rem, 4vw, 2.2rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 0.25rem;
                    text-shadow: 0 0 12px rgba(255,20,147,0.45);
                }
                .clients-sub { color: #777; font-size: 0.85rem; margin: 0; }

                .glass-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    box-shadow: 0 0 28px rgba(255,20,147,0.08), 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07);
                }

                .btn-primary {
                    background: rgba(255,20,147,0.18);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #FF1493;
                    text-shadow: 0 0 8px rgba(255,20,147,0.35);
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(10px);
                }
                .btn-primary:hover {
                    background: rgba(255,20,147,0.28);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255,20,147,0.35);
                    transform: translateY(-1px);
                }

                .btn-ghost {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.35);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .clients-search {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .search-input {
                    flex: 1;
                    min-width: 220px;
                    padding: 0.875rem;
                    background: rgba(0,0,0,0.45);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-bottom: 1px solid rgba(255,20,147,0.3);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.9rem;
                }

                .clients-table { overflow: hidden; }
                .table-scroll { overflow-x: auto; }
                .table { width: 100%; border-collapse: collapse; min-width: 900px; }
                .table-head { background: rgba(255,20,147,0.05); }
                .th-cell {
                    padding: 1rem;
                    text-align: left;
                    color: rgba(255,20,147,0.85);
                    font-weight: 900;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid rgba(255,20,147,0.18);
                }
                .td-cell { padding: 1rem; color: rgba(255,255,255,0.82); font-size: 0.88rem; }
                .td-muted { color: rgba(255,255,255,0.4); }
                .td-empty { padding: 3rem; text-align: center; color: #666; }
                .tr-row { border-bottom: 1px solid rgba(255,255,255,0.04); }

                .client-cell { display: flex; align-items: center; gap: 0.75rem; }
                .client-avatar {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,20,147,0.18);
                    border: 1px solid rgba(255,20,147,0.45);
                    color: #FF1493;
                    box-shadow: 0 0 12px rgba(255,20,147,0.18), inset 0 1px 0 rgba(255,255,255,0.08);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900;
                    font-size: 1rem;
                    flex-shrink: 0;
                }
                .client-name { color: #fff; font-weight: 700; }
                .client-name-muted { color: #555; fontStyle: italic; }

                .plan-pill {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(255,20,147,0.08);
                    color: rgba(255,20,147,0.9);
                    border: 1px solid rgba(255,20,147,0.35);
                    padding: 0.3rem 0.65rem;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    white-space: nowrap;
                    max-width: 100%;
                    line-height: 1;
                }

                .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .btn-action {
                    padding: 0.45rem 0.7rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    cursor: pointer;
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.3);
                    color: rgba(255,20,147,0.95);
                }
                .btn-amber, .btn-blue, .btn-orange, .btn-green, .btn-gray { border-color: rgba(255,20,147,0.3); color: rgba(255,20,147,0.95); background: rgba(255,20,147,0.08); }
                .btn-red { border-color: rgba(239,68,68,0.6); color: #ef4444; background: rgba(239,68,68,0.08); }

                /* NeonSelect (igual a Clases) */
                .nsel-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.875rem; background:rgba(255,20,147,0.05); border:1px solid rgba(255,20,147,0.2); border-radius:10px; color:rgba(255,255,255,0.8); font-size:0.82rem; cursor:pointer; transition:all 0.2s; text-align:left; gap:0.5rem; font-family:inherit; }
                .nsel-btn:hover, .nsel-btn.open { border-color:rgba(255,20,147,0.55); background:rgba(255,20,147,0.08); }
                .nsel-val { color:#fff; font-weight:600; flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .nsel-ph  { color:rgba(255,255,255,0.3); flex:1; }
                .nsel-arr { color:rgba(255,20,147,0.7); font-size:1rem; flex-shrink:0; transform:rotate(90deg); transition:transform 0.2s; display:inline-block; }
                .nsel-arr.up { transform:rotate(-90deg); }
                .nsel-drop { background:rgba(8,3,14,0.97); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,20,147,0.35); border-radius:12px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.75),0 0 30px rgba(255,20,147,0.1); max-height:240px; overflow-y:auto; animation:nsdrop 0.15s cubic-bezier(.34,1.56,.64,1); }
                @keyframes nsdrop { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                .nsel-opt { width:100%; display:flex; align-items:center; gap:0.55rem; padding:0.65rem 0.875rem; background:none; border:none; border-bottom:1px solid rgba(255,20,147,0.07); color:rgba(255,255,255,0.7); font-size:0.82rem; font-weight:500; text-align:left; cursor:pointer; transition:all 0.15s; font-family:inherit; }
                .nsel-opt:last-child { border-bottom:none; }
                .nsel-opt:hover { background:rgba(255,20,147,0.1); color:#FF1493; }
                .nsel-opt.active { background:rgba(255,20,147,0.13); color:#FF1493; font-weight:700; }
                .nsel-opt-empty { color:rgba(255,255,255,0.3); font-style:italic; }
                .nsel-opt-lbl { flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .nsel-chk { margin-left:auto; color:#FF1493; font-size:0.75rem; }
                .nsel-drop::-webkit-scrollbar { width:4px; }
                .nsel-drop::-webkit-scrollbar-track { background:transparent; }
                .nsel-drop::-webkit-scrollbar-thumb { background:rgba(255,20,147,0.3); border-radius:4px; }

                @media (max-width: 600px) {
                    .plan-pill { font-size: 0.68rem; padding: 0.25rem 0.5rem; }
                    .td-cell { padding: 0.8rem; }
                }

                @media (max-width: 768px) {
                    .clients-search { gap: 0.75rem; }
                    .btn-primary, .btn-ghost { width: 100%; }
                    .table { min-width: 760px; }
                }

                @media (max-width: 480px) {
                    .clients-header { align-items: flex-start; }
                    .clients-title { font-size: 1.6rem; }
                    .modal-card { max-width: 100%; }
                }

                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    z-index: 4000;
                    animation: fadeIn 0.15s ease;
                }
                .modal-card {
                    width: min(560px, 100%);
                    background: rgba(10,10,14,0.95);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-top: 2px solid var(--accent, #FF1493);
                    border-radius: 14px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(255,20,147,0.15);
                    overflow: hidden;
                    animation: popIn 0.18s ease;
                }
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .modal-title { margin: 0; color: #fff; font-size: 1.05rem; font-weight: 900; }
                .modal-close {
                    background: transparent;
                    border: none;
                    color: #999;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                .modal-form { display: grid; gap: 1rem; padding: 1.25rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .info-box {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.25);
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                }
                .info-text { margin: 0; color: rgba(255,255,255,0.7); font-size: 0.82rem; }
                .link-hint {
                    background: none;
                    border: none;
                    color: #ffc107;
                    font-size: 0.75rem;
                    margin-top: 0.4rem;
                    cursor: pointer;
                }

                .toggle-wrap { display: inline-flex; align-items: center; gap: 0.4rem; }
                .toggle-switch {
                    width: 42px;
                    height: 24px;
                    border-radius: 999px;
                    background: rgba(107,114,128,0.35);
                    border: 1px solid rgba(107,114,128,0.6);
                    position: relative;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .toggle-switch.on {
                    background: rgba(34,197,94,0.25);
                    border-color: rgba(34,197,94,0.7);
                }
                .toggle-knob {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #fff;
                    transition: transform 0.2s;
                }
                .toggle-switch.on .toggle-knob { transform: translateX(18px); }
                .toggle-label { font-size: 0.75rem; color: rgba(255,255,255,0.7); }

                .btn-gray { border-color: rgba(107,114,128,0.6); color: #9ca3af; background: rgba(107,114,128,0.08); }

                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes popIn { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
            `}</style>
        </DashboardLayout>
    );
}

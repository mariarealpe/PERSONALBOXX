import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function ClientesIndex({ auth, clientes, planes, filters }) {
    const [showModal,     setShowModal]     = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

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

    const handleDelete = (c) => {
        if (confirm(`¿Eliminar al cliente "${c.name}"?`)) {
            router.delete(route('admin.clientes.destroy', c.id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.clientes.index'), { search }, { preserveState: true, replace: true });
    };

    const handleReenviarActivacion = (c) => {
        if (confirm(`¿Reenviar correo de activación a ${c.email}?`)) {
            router.post(route('admin.clientes.reenviar-activacion', c.id));
        }
    };

    const handleToggleActivo = (c) => {
        const msg = c.estado_cuenta === 'inactivo'
            ? `¿Activar la cuenta de "${c.name}"?`
            : `¿Desactivar la cuenta de "${c.name}"?`;
        if (confirm(msg)) router.patch(route('admin.clientes.toggle-activo', c.id));
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

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Clientes" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>CLIENTES</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Gestiona los clientes del box</p>
                    </div>
                    <button onClick={openCreate} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(255,20,147,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ➕ Nuevo Cliente
                    </button>
                </div>

                {/* Búsqueda */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." style={{ ...inputStyle, flex: 1 }} />
                    <button type="submit" style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>🔍 Buscar</button>
                </form>

                {/* Tabla */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 20px rgba(255,20,147,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,20,147,0.1)' }}>
                        <tr>
                            {['Cliente', 'Email', 'Estado', 'Plan Activo', 'Vencimiento', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#FF1493', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(255,20,147,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {clientes.data.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay clientes registrados</td></tr>
                        ) : clientes.data.map(c => {
                            const pa = c.plan_activo;
                            return (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)' }}>
                                    {/* Nombre */}
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FF1493,#C71585)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                                                {(c.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ color: '#fff', fontWeight: 700 }}>{c.name || <span style={{ color: '#555', fontStyle: 'italic' }}>Sin nombre</span>}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td style={{ padding: '1rem', color: '#999', fontSize: '0.875rem' }}>{c.email}</td>

                                    {/* Estado RF-23 */}
                                    <td style={{ padding: '1rem' }}>
                                        {estadoBadge(c.estado_cuenta)}
                                    </td>

                                    {/* Plan */}
                                    <td style={{ padding: '1rem' }}>
                                        {pa ? (
                                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e', padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                                                {pa.nombre}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#555', fontSize: '0.875rem' }}>Sin plan</span>
                                        )}
                                    </td>

                                    {/* Vencimiento */}
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {pa ? (() => {
                                            const dias  = Math.ceil((new Date(pa.fecha_vencimiento) - new Date()) / 86400000);
                                            const color = dias <= 5 ? '#ef4444' : dias <= 10 ? '#eab308' : '#ccc';
                                            return <span style={{ color, fontWeight: dias <= 10 ? 700 : 400 }}>{new Date(pa.fecha_vencimiento).toLocaleDateString('es-CO')}</span>;
                                        })() : <span style={{ color: '#555' }}>—</span>}
                                    </td>

                                    {/* Acciones */}
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            {/* Asignar plan */}
                                            <button onClick={() => openPlanModal(c)} title="Asignar plan" style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid #ffc107', color: '#ffc107', padding: '0.45rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>💎</button>

                                            {/* Editar */}
                                            <button onClick={() => openEdit(c)} title="Editar" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '0.45rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>✏️</button>

                                            {/* Reenviar activación — solo si está pendiente (RF-24) */}
                                            {c.estado_cuenta === 'pendiente' && (
                                                <button onClick={() => handleReenviarActivacion(c)} title="Reenviar correo de activación" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid #fb923c', color: '#fb923c', padding: '0.45rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>📧</button>
                                            )}

                                            {/* Activar / Desactivar (RF-24) */}
                                            {['activo','logueado','inactivo'].includes(c.estado_cuenta) && (
                                                <button
                                                    onClick={() => handleToggleActivo(c)}
                                                    title={c.estado_cuenta === 'inactivo' ? 'Activar cliente' : 'Desactivar cliente'}
                                                    style={{ background: c.estado_cuenta === 'inactivo' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', border: `1px solid ${c.estado_cuenta === 'inactivo' ? '#22c55e' : '#6b7280'}`, color: c.estado_cuenta === 'inactivo' ? '#22c55e' : '#6b7280', padding: '0.45rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                                                >
                                                    {c.estado_cuenta === 'inactivo' ? '▶' : '⏸'}
                                                </button>
                                            )}

                                            {/* Eliminar */}
                                            <button onClick={() => handleDelete(c)} title="Eliminar" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '0.45rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {clientes.links.length > 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        {clientes.links.map((link, i) => (
                            <button key={i} onClick={() => link.url && router.visit(link.url)} disabled={!link.url}
                                    style={{ background: link.active ? '#FF1493' : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#000' : '#FF1493', padding: '0.5rem 1rem', borderRadius: 6, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.3, fontWeight: 600 }}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}

                {/* ── Modal Crear / Editar Cliente ─────────────────────────── */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={closeModal}>
                        <div style={{ background: 'rgba(10,10,10,0.98)', border: '2px solid #FF1493', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 0 40px rgba(255,20,147,0.5)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,20,147,0.3)' }}>
                                <h2 style={{ color: '#FF1493', fontWeight: 900, margin: 0 }}>
                                    {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                                </h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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
                                    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '0.875rem 1rem' }}>
                                        <p style={{ color: '#93c5fd', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                                            📧 Se enviará automáticamente un correo de activación al cliente. Él mismo creará su contraseña al activar la cuenta.
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,20,147,0.3)' }}>
                                    <button type="button" onClick={closeModal} style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid rgba(255,20,147,0.3)', color: '#FF1493', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                    <button type="submit" disabled={processing} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>
                                        {processing ? 'Guardando...' : editingCliente ? 'Guardar' : 'Crear y Enviar Correo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal Asignar Plan ────────────────────────────────────── */}
                {showPlanModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={closePlanModal}>
                        <div style={{ background: 'rgba(10,10,10,0.98)', border: '2px solid #ffc107', borderRadius: 12, width: '100%', maxWidth: 450, boxShadow: '0 0 40px rgba(255,193,7,0.3)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,193,7,0.3)' }}>
                                <h2 style={{ color: '#ffc107', fontWeight: 900, margin: 0 }}>💎 Asignar Plan — {selectedCliente?.name || selectedCliente?.email}</h2>
                                <button onClick={closePlanModal} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            </div>
                            <form onSubmit={handlePlanSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Plan *</label>
                                    <select value={planForm.data.plan_id} onChange={e => planForm.setData('plan_id', e.target.value)} required style={{ ...inputStyle, color: planForm.data.plan_id ? '#fff' : '#666', cursor: 'pointer' }}>
                                        <option value="">-- Seleccionar plan --</option>
                                        {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — ${new Intl.NumberFormat('es-CO').format(p.precio)}</option>)}
                                    </select>
                                    {planForm.errors.plan_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.plan_id}</p>}
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Fecha de Inicio *</label>
                                    <input type="date" value={planForm.data.fecha_inicio} onChange={e => planForm.setData('fecha_inicio', e.target.value)} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Fecha de Vencimiento *</label>
                                    <input type="date" value={planForm.data.fecha_vencimiento} onChange={e => planForm.setData('fecha_vencimiento', e.target.value)} required style={inputStyle} />
                                    <button type="button" onClick={sugerirFechaFin} style={{ background: 'none', border: 'none', color: '#ffc107', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' }}>
                                        📅 Sugerir 30 días desde el inicio
                                    </button>
                                    {planForm.errors.fecha_vencimiento && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.fecha_vencimiento}</p>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,193,7,0.3)' }}>
                                    <button type="button" onClick={closePlanModal} style={{ background: 'rgba(255,193,7,0.1)', border: '2px solid rgba(255,193,7,0.3)', color: '#ffc107', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                    <button type="submit" disabled={planForm.processing} style={{ background: 'linear-gradient(135deg,#ffc107,#e6a800)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: planForm.processing ? 0.5 : 1 }}>
                                        {planForm.processing ? 'Asignando...' : 'Asignar Plan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

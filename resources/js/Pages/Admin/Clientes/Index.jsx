import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function ClientesIndex({ auth, clientes, planes, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({ name: '', email: '', password: '' });

    const planForm = useForm({
        plan_id:           '',
        fecha_inicio:      new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
    });

    const openCreate = () => { reset(); setEditingCliente(null); setShowModal(true); };
    const openEdit = (c) => { setData({ name: c.name, email: c.email, password: '' }); setEditingCliente(c); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditingCliente(null); reset(); };

    const openPlanModal = (c) => {
        setSelectedCliente(c);
        planForm.reset();
        planForm.setData({
            plan_id:           '',
            fecha_inicio:      new Date().toISOString().split('T')[0],
            fecha_vencimiento: '',
        });
        setShowPlanModal(true);
    };
    const closePlanModal = () => { setShowPlanModal(false); setSelectedCliente(null); };

    // Sugerir fecha de vencimiento 30 días después del inicio
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
        if (confirm(`¿Eliminar al cliente "${c.name}"?`)) router.delete(route('admin.clientes.destroy', c.id));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.clientes.index'), { search }, { preserveState: true, replace: true });
    };

    const inputStyle = { width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Clientes" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>CLIENTES</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Gestiona los clientes del box</p>
                    </div>
                    <button onClick={openCreate} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(255,20,147,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ➕ Nuevo Cliente
                    </button>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." style={{ ...inputStyle, flex: 1 }} />
                    <button type="submit" style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>🔍 Buscar</button>
                </form>

                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 20px rgba(255,20,147,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,20,147,0.1)' }}>
                        <tr>
                            {['Cliente', 'Email', 'Plan Activo', 'Vencimiento', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#FF1493', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(255,20,147,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {clientes.data.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay clientes registrados</td></tr>
                        ) : clientes.data.map(c => {
                            // CAMBIO: usar plan_activo que viene mapeado del controlador
                            const pa = c.plan_activo;
                            return (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#FF1493,#C71585)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1.125rem', flexShrink: 0 }}>
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ color: '#fff', fontWeight: 700 }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#999', fontSize: '0.875rem' }}>{c.email}</td>

                                    {/* Plan Activo */}
                                    <td style={{ padding: '1rem' }}>
                                        {pa ? (
                                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e', padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                                                {pa.nombre}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#666', fontSize: '0.875rem' }}>Sin plan</span>
                                        )}
                                    </td>

                                    {/* Vencimiento con color según cercanía */}
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {pa ? (() => {
                                            const dias = Math.ceil((new Date(pa.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                                            const color = dias <= 5 ? '#ef4444' : dias <= 10 ? '#eab308' : '#ccc';
                                            return (
                                                <span style={{ color, fontWeight: dias <= 10 ? 700 : 400 }}>
                                                    {new Date(pa.fecha_vencimiento).toLocaleDateString('es-CO')}
                                                </span>
                                            );
                                        })() : <span style={{ color: '#555' }}>-</span>}
                                    </td>

                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button onClick={() => openPlanModal(c)} style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid #ffc107', color: '#ffc107', padding: '0.5rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }} title="Asignar Plan">💎 Plan</button>
                                            <button onClick={() => openEdit(c)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '0.5rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }} title="Editar">✏️</button>
                                            <button onClick={() => handleDelete(c)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '0.5rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }} title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {clientes.links.length > 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        {clientes.links.map((link, i) => (
                            <button key={i} onClick={() => link.url && router.visit(link.url)} disabled={!link.url}
                                    style={{ background: link.active ? '#FF1493' : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#000' : '#FF1493', padding: '0.5rem 1rem', borderRadius: 6, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.3, fontWeight: 600 }}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}

                {/* Modal Cliente — sin cambios */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={closeModal}>
                        <div style={{ background: 'rgba(10,10,10,0.98)', border: '2px solid #FF1493', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 0 40px rgba(255,20,147,0.5)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,20,147,0.3)' }}>
                                <h2 style={{ color: '#FF1493', fontWeight: 900, margin: 0 }}>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div><label style={labelStyle}>Nombre Completo *</label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Juan García" style={inputStyle} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.name}</p>}</div>
                                <div><label style={labelStyle}>Correo Electrónico *</label><input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required placeholder="cliente@email.com" style={inputStyle} />{errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.email}</p>}</div>
                                <div><label style={labelStyle}>Contraseña {!editingCliente && '*'} {editingCliente && <span style={{ color: '#666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(en blanco = sin cambio)</span>}</label><input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!editingCliente} placeholder="Mínimo 8 caracteres" style={inputStyle} />{errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</p>}</div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,20,147,0.3)' }}>
                                    <button type="button" onClick={closeModal} style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid rgba(255,20,147,0.3)', color: '#FF1493', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                    <button type="submit" disabled={processing} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>{processing ? 'Guardando...' : 'Guardar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Plan */}
                {showPlanModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={closePlanModal}>
                        <div style={{ background: 'rgba(10,10,10,0.98)', border: '2px solid #ffc107', borderRadius: 12, width: '100%', maxWidth: 450, boxShadow: '0 0 40px rgba(255,193,7,0.3)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,193,7,0.3)' }}>
                                <h2 style={{ color: '#ffc107', fontWeight: 900, margin: 0 }}>💎 Asignar Plan — {selectedCliente?.name}</h2>
                                <button onClick={closePlanModal} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            </div>
                            <form onSubmit={handlePlanSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Plan */}
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Plan *</label>
                                    <select value={planForm.data.plan_id} onChange={e => planForm.setData('plan_id', e.target.value)} required style={{ ...inputStyle, color: planForm.data.plan_id ? '#fff' : '#666' }}>
                                        <option value="">-- Seleccionar plan --</option>
                                        {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — ${new Intl.NumberFormat('es-CO').format(p.precio)}</option>)}
                                    </select>
                                    {planForm.errors.plan_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.plan_id}</p>}
                                </div>

                                {/* Fecha inicio */}
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Fecha de Inicio *</label>
                                    <input type="date" value={planForm.data.fecha_inicio} onChange={e => planForm.setData('fecha_inicio', e.target.value)} required style={inputStyle} />
                                    {planForm.errors.fecha_inicio && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.fecha_inicio}</p>}
                                </div>

                                {/* Fecha vencimiento con botón sugerir */}
                                <div>
                                    <label style={{ ...labelStyle, color: '#ffc107' }}>Fecha de Vencimiento *</label>
                                    <input type="date" value={planForm.data.fecha_vencimiento} onChange={e => planForm.setData('fecha_vencimiento', e.target.value)} required style={inputStyle} />
                                    <button
                                        type="button"
                                        onClick={sugerirFechaFin}
                                        style={{ background: 'none', border: 'none', color: '#ffc107', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline', textUnderlineOffset: 3 }}
                                    >
                                        📅 Sugerir 30 días desde el inicio
                                    </button>
                                    {planForm.errors.fecha_vencimiento && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{planForm.errors.fecha_vencimiento}</p>}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,193,7,0.3)' }}>
                                    <button type="button" onClick={closePlanModal} style={{ background: 'rgba(255,193,7,0.1)', border: '2px solid rgba(255,193,7,0.3)', color: '#ffc107', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                    <button type="submit" disabled={planForm.processing} style={{ background: 'linear-gradient(135deg,#ffc107,#e6a800)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: planForm.processing ? 0.5 : 1 }}>{planForm.processing ? 'Asignando...' : 'Asignar Plan'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

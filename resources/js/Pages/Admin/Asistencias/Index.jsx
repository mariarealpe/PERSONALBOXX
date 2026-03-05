import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function AsistenciasIndex({ auth, clasesHoy, claseSeleccionada, inscritos, asistentes, clientes, filters }) {
    const [fecha, setFecha] = useState(filters.fecha || new Date().toISOString().split('T')[0]);
    const [busquedaCliente, setBusquedaCliente] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        clase_id: filters.clase_id || '',
        cliente_id: '',
    });

    const selectClase = (claseId) => {
        router.get(route('admin.asistencias.index'), { clase_id: claseId, fecha }, { preserveState: true, replace: true });
        setData('clase_id', claseId);
    };

    const handleFecha = () => {
        router.get(route('admin.asistencias.index'), { fecha }, { preserveState: true, replace: true });
    };

    const handleRegistrar = (e) => {
        e.preventDefault();
        post(route('admin.asistencias.registrar'), { onSuccess: () => { reset('cliente_id'); setBusquedaCliente(''); } });
    };

    const handleEliminar = (id) => {
        if (confirm('¿Eliminar esta asistencia?')) router.delete(route('admin.asistencias.eliminar', id));
    };

    const clientesFiltrados = clientes.filter(c =>
        c.name.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.email.toLowerCase().includes(busquedaCliente.toLowerCase())
    ).slice(0, 8);

    const asistenteIds = asistentes.map(a => a.cliente_id);
    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '-';
    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';

    const boxStyle = { background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 0 20px rgba(255,20,147,0.1)' };
    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Registro de Asistencias" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>ASISTENCIAS</h1>
                    <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Registra la asistencia de clientes a las clases</p>
                </div>

                {/* Selector de fecha */}
                <div style={{ ...boxStyle, marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha</label>
                        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
                    </div>
                    <button onClick={handleFecha} style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Ver Clases</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
                    {/* Lista de clases del día */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h3 style={{ color: '#FF1493', fontWeight: 900, margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: 1 }}>Clases del Día</h3>
                        {clasesHoy.length === 0 ? (
                            <div style={{ ...boxStyle, color: '#666', textAlign: 'center', padding: '2rem' }}>No hay clases para esta fecha</div>
                        ) : clasesHoy.map(c => (
                            <button key={c.id} onClick={() => selectClase(c.id)}
                                    style={{ ...boxStyle, padding: '1rem', cursor: 'pointer', border: `2px solid ${claseSeleccionada?.id === c.id ? '#FF1493' : 'rgba(255,20,147,0.3)'}`, background: claseSeleccionada?.id === c.id ? 'rgba(255,20,147,0.1)' : 'rgba(10,10,10,0.95)', textAlign: 'left', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || '#FF1493', flexShrink: 0 }} />
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{c.tipo_clase?.nombre}</span>
                                </div>
                                <div style={{ color: '#999', fontSize: '0.8rem' }}>{formatTime(c.fecha_hora_inicio)} — {c.instructor?.name}</div>
                            </button>
                        ))}
                    </div>

                    {/* Panel de asistencia */}
                    <div>
                        {!claseSeleccionada ? (
                            <div style={{ ...boxStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#666' }}>
                                👈 Selecciona una clase para gestionar asistencias
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Info clase */}
                                <div style={boxStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <h2 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 0.5rem', fontSize: '1.5rem' }}>{claseSeleccionada.tipo_clase?.nombre}</h2>
                                            <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>Instructor: {claseSeleccionada.instructor?.name} | {formatDate(claseSeleccionada.fecha_hora_inicio)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#FF1493', fontWeight: 900, fontSize: '2rem' }}>{asistentes.length} / {claseSeleccionada.capacidad_maxima}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>asistentes registrados</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Registrar asistencia */}
                                <div style={boxStyle}>
                                    <h3 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Registrar Asistencia</h3>
                                    <form onSubmit={handleRegistrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Buscar Cliente</label>
                                            <input type="text" value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} placeholder="Nombre o email del cliente..." style={inputStyle} />
                                            {busquedaCliente && clientesFiltrados.length > 0 && (
                                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#111', border: '2px solid #FF1493', borderRadius: 8, zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                                                    {clientesFiltrados.map(c => (
                                                        <button key={c.id} type="button" onClick={() => { setData('cliente_id', c.id); setBusquedaCliente(c.name); }}
                                                                style={{ width: '100%', padding: '0.75rem 1rem', background: asistenteIds.includes(c.id) ? 'rgba(34,197,94,0.1)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,20,147,0.1)', color: asistenteIds.includes(c.id) ? '#22c55e' : '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span>{c.name}</span>
                                                            {asistenteIds.includes(c.id) && <span style={{ fontSize: '0.75rem' }}>✓ Ya registrado</span>}
                                                            {inscritos.some(r => r.cliente_id === c.id) && <span style={{ fontSize: '0.75rem', color: '#ffc107' }}>📋 Con reserva</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {errors.cliente_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: 0 }}>{errors.cliente_id}</p>}
                                        <button type="submit" disabled={processing || !data.cliente_id} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: (processing || !data.cliente_id) ? 0.5 : 1 }}>
                                            ✅ {processing ? 'Registrando...' : 'Registrar Asistencia'}
                                        </button>
                                    </form>
                                </div>

                                {/* Lista de asistentes */}
                                <div style={boxStyle}>
                                    <h3 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Asistentes Registrados ({asistentes.length})</h3>
                                    {asistentes.length === 0 ? (
                                        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Aún no hay asistentes registrados</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {asistentes.map((a, i) => (
                                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#0a0a0a', borderRadius: 8, border: '1px solid rgba(255,20,147,0.1)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span style={{ color: '#FF1493', fontWeight: 700, fontSize: '0.875rem', minWidth: 24 }}>{i + 1}</span>
                                                        <div>
                                                            <div style={{ color: '#fff', fontWeight: 700 }}>{a.cliente?.name}</div>
                                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>
                                                                {a.tenia_reserva ? '📋 Con reserva' : '🚶 Walk-in'} | {formatTime(a.hora_registro)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleEliminar(a.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '0.375rem 0.625rem', borderRadius: 6, cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem' }} title="Eliminar">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

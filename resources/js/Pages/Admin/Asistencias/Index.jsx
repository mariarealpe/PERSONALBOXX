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

    const boxStyle = {
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 16,
        padding: '1.5rem',
        boxShadow: '0 0 24px rgba(255,20,147,0.12), 0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
    };
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,20,147,0.35)',
        borderRadius: 10,
        color: '#fff',
        fontSize: '0.875rem',
        boxSizing: 'border-box'
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Registro de Asistencias" />
            <div className="asist-wrap">
                <div className="asist-header">
                    <h1 className="asist-title">ASISTENCIAS</h1>
                    <p className="asist-sub">Registra la asistencia de clientes a las clases</p>
                </div>

                {/* Selector de fecha */}
                <div className="asist-datebar" style={boxStyle}>
                    <div className="asist-field">
                        <label className="asist-label">Fecha</label>
                        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
                    </div>
                    <button onClick={handleFecha} className="neon-btn">Ver Clases</button>
                </div>

                <div className="asist-grid">
                    {/* Lista de clases del día */}
                    <div className="class-list">
                        <h3 className="list-title">Clases del Día</h3>
                        {clasesHoy.length === 0 ? (
                            <div className="empty-box" style={boxStyle}>No hay clases para esta fecha</div>
                        ) : clasesHoy.map(c => (
                            <button
                                key={c.id}
                                onClick={() => selectClase(c.id)}
                                className="class-item"
                                style={{
                                    ...boxStyle,
                                    padding: '1rem',
                                    textAlign: 'left',
                                    borderColor: claseSeleccionada?.id === c.id ? '#FF1493' : 'rgba(255,255,255,0.08)',
                                    background: claseSeleccionada?.id === c.id ? 'rgba(255,20,147,0.08)' : boxStyle.background,
                                }}
                            >
                                <div className="class-item-head">
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || '#FF1493', flexShrink: 0 }} />
                                    <span className="class-name">{c.tipo_clase?.nombre}</span>
                                </div>
                                <div className="class-meta">{formatTime(c.fecha_hora_inicio)} — {c.instructor?.name}</div>
                            </button>
                        ))}
                    </div>

                    {/* Panel de asistencia */}
                    <div>
                        {!claseSeleccionada ? (
                            <div className="empty-box" style={{ ...boxStyle, minHeight: 300 }}>
                                👈 Selecciona una clase para gestionar asistencias
                            </div>
                        ) : (
                            <div className="panel-stack">
                                {/* Info clase */}
                                <div style={boxStyle}>
                                    <div className="class-info">
                                        <div>
                                            <h2 className="class-title">{claseSeleccionada.tipo_clase?.nombre}</h2>
                                            <p className="class-sub">Instructor: {claseSeleccionada.instructor?.name} | {formatDate(claseSeleccionada.fecha_hora_inicio)}</p>
                                        </div>
                                        <div className="class-cap">
                                            <div className="class-cap-value">{asistentes.length} / {claseSeleccionada.capacidad_maxima}</div>
                                            <div className="class-cap-label">asistentes registrados</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Registrar asistencia */}
                                <div style={boxStyle}>
                                    <h3 className="panel-title">Registrar Asistencia</h3>
                                    <form onSubmit={handleRegistrar} className="panel-form">
                                        <div style={{ position: 'relative' }}>
                                            <label className="asist-label">Buscar Cliente</label>
                                            <input type="text" value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} placeholder="Nombre o email del cliente..." style={inputStyle} />
                                            {busquedaCliente && clientesFiltrados.length > 0 && (
                                                <div className="autocomplete">
                                                    {clientesFiltrados.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => { setData('cliente_id', c.id); setBusquedaCliente(c.name); }}
                                                            className="autocomplete-item"
                                                            style={{
                                                                background: asistenteIds.includes(c.id) ? 'rgba(34,197,94,0.1)' : 'transparent',
                                                                color: asistenteIds.includes(c.id) ? '#22c55e' : '#fff',
                                                            }}
                                                        >
                                                            <span>{c.name}</span>
                                                            {asistenteIds.includes(c.id) && <span className="tag">✓ Ya registrado</span>}
                                                            {inscritos.some(r => r.cliente_id === c.id) && <span className="tag warn">Con reserva</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {errors.cliente_id && <p className="error-text">{errors.cliente_id}</p>}
                                        <button type="submit" disabled={processing || !data.cliente_id} className="primary-action">
                                            {processing ? 'Registrando...' : 'Registrar Asistencia'}
                                        </button>
                                    </form>
                                </div>

                                {/* Lista de asistentes */}
                                <div style={boxStyle}>
                                    <h3 className="panel-title">Asistentes Registrados ({asistentes.length})</h3>
                                    {asistentes.length === 0 ? (
                                        <p className="empty-muted">Aún no hay asistentes registrados</p>
                                    ) : (
                                        <div className="attendees-list">
                                            {asistentes.map((a, i) => (
                                                <div key={a.id} className="attendee-item">
                                                    <div className="attendee-left">
                                                        <span className="attendee-index">{i + 1}</span>
                                                        <div>
                                                            <div className="attendee-name">{a.cliente?.name}</div>
                                                            <div className="attendee-meta">
                                                                {a.tenia_reserva ? 'Con reserva' : 'Walk-in'} | {formatTime(a.hora_registro)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleEliminar(a.id)} className="danger-btn" title="Eliminar">Eliminar</button>
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

            <style>{`
                .asist-wrap {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .asist-header { margin-bottom: 0.25rem; }
                .asist-title {
                    font-size: clamp(1.6rem, 4vw, 2.4rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 0.25rem;
                    text-shadow: 0 0 12px rgba(255,20,147,0.45);
                }
                .asist-sub { color: #777; font-size: 0.85rem; margin: 0; }

                .asist-datebar {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }
                .asist-field { flex: 1; min-width: 200px; }
                .asist-label {
                    display: block;
                    color: #FF1493;
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .neon-btn {
                    background: rgba(255,20,147,0.12);
                    border: 1px solid rgba(255,255,255,0.22);
                    color: #FF1493;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(10px);
                }
                .neon-btn:hover {
                    background: rgba(255,20,147,0.22);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255,20,147,0.35);
                    transform: translateY(-1px);
                }

                .asist-grid {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 1.5rem;
                }

                .class-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .list-title {
                    color: #FF1493;
                    font-weight: 900;
                    margin: 0;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .class-item {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .class-item:hover { transform: translateY(-1px); box-shadow: 0 0 24px rgba(255,20,147,0.18); }

                .class-item-head {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }
                .class-name { color: #fff; font-weight: 700; font-size: 0.9rem; }
                .class-meta { color: #999; font-size: 0.8rem; }

                .empty-box {
                    color: #777;
                    text-align: center;
                    padding: 2rem;
                }

                .panel-stack { display: flex; flex-direction: column; gap: 1.5rem; }

                .class-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .class-title {
                    color: #FF1493;
                    font-weight: 900;
                    margin: 0 0 0.5rem;
                    font-size: 1.5rem;
                }
                .class-sub { color: #999; margin: 0; font-size: 0.875rem; }
                .class-cap { text-align: right; }
                .class-cap-value { color: #FF1493; font-weight: 900; font-size: 2rem; }
                .class-cap-label { color: #666; fontSize: 0.75rem; }

                .panel-title {
                    color: #FF1493;
                    font-weight: 900;
                    margin: 0 0 1rem;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .panel-form { display: flex; flex-direction: column; gap: 1rem; }

                .autocomplete {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: rgba(10,10,10,0.95);
                    border: 1px solid rgba(255,20,147,0.35);
                    border-radius: 10px;
                    z-index: 100;
                    max-height: 200px;
                    overflow-y: auto;
                    backdrop-filter: blur(8px);
                }
                .autocomplete-item {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: transparent;
                }
                .tag { font-size: 0.75rem; color: #22c55e; }
                .tag.warn { color: #f59e0b; }

                .error-text { color: #ef4444; font-size: 0.75rem; margin: 0; }

                .primary-action {
                    background: rgba(255,20,147,0.2);
                    color: #FF1493;
                    border: 1px solid rgba(255,255,255,0.18);
                    padding: 0.875rem;
                    border-radius: 10px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .primary-action:hover:not(:disabled) {
                    background: rgba(255,20,147,0.32);
                    color: #fff;
                    box-shadow: 0 0 22px rgba(255,20,147,0.35);
                }
                .primary-action:disabled { opacity: 0.5; cursor: not-allowed; }

                .attendees-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .attendee-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: rgba(0,0,0,0.35);
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.06);
                }
                .attendee-left { display: flex; align-items: center; gap: 0.75rem; }
                .attendee-index { color: #FF1493; font-weight: 700; font-size: 0.875rem; min-width: 24px; }
                .attendee-name { color: #fff; font-weight: 700; }
                .attendee-meta { color: #666; font-size: 0.75rem; }

                .danger-btn {
                    background: rgba(239,68,68,0.1);
                    border: 1px solid #ef4444;
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #ef4444;
                    font-size: 0.8rem;
                }

                .empty-muted {
                    color: #666;
                    text-align: center;
                    padding: 2rem;
                }

                @media (max-width: 1100px) {
                    .asist-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 700px) {
                    .asist-datebar { gap: 0.75rem; }
                    .neon-btn { width: 100%; }
                }

                @media (max-width: 480px) {
                    .class-cap { text-align: left; }
                    .class-cap-value { font-size: 1.6rem; }
                }
            `}</style>
        </DashboardLayout>
    );
}

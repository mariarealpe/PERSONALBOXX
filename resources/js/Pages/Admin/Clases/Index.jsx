import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function ClasesIndex({ auth, clases, tiposClase, instructores, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingClase, setEditingClase] = useState(null);
    const [vista, setVista] = useState(filters.vista || 'semana');
    const [fecha, setFecha] = useState(filters.fecha || new Date().toISOString().split('T')[0]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        tipo_clase_id: '',
        instructor_id: '',
        fecha_hora_inicio: '',
        fecha_hora_fin: '',
        capacidad_maxima: '',
        sala: '',
        estado: 'programada',
    });

    const openCreateModal = () => {
        reset();
        setEditingClase(null);
        setShowModal(true);
    };

    const openEditModal = (clase) => {
        setData({
            tipo_clase_id: clase.tipo_clase_id,
            instructor_id: clase.instructor_id,
            fecha_hora_inicio: clase.fecha_hora_inicio?.slice(0, 16) || '',
            fecha_hora_fin: clase.fecha_hora_fin?.slice(0, 16) || '',
            capacidad_maxima: clase.capacidad_maxima,
            sala: clase.sala || '',
            estado: clase.estado,
        });
        setEditingClase(clase);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClase(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClase) {
            put(route('admin.clases.update', editingClase.id), { onSuccess: closeModal });
        } else {
            post(route('admin.clases.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (clase) => {
        if (confirm(`¿Eliminar la clase de ${clase.tipo_clase?.nombre}?`)) {
            router.delete(route('admin.clases.destroy', clase.id));
        }
    };

    const handleFiltrar = () => {
        router.get(route('admin.clases.index'), { fecha, vista, tipo_clase_id: filters.tipo_clase_id, instructor_id: filters.instructor_id }, {
            preserveState: true, replace: true,
        });
    };

    const estadoColor = { programada: '#3b82f6', en_curso: '#22c55e', finalizada: '#6b7280', cancelada: '#ef4444' };
    const estadoLabel = { programada: 'Programada', en_curso: 'En Curso', finalizada: 'Finalizada', cancelada: 'Cancelada' };

    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Clases" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>CLASES</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Gestiona el calendario de clases del box</p>
                    </div>
                    <button onClick={openCreateModal} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 0 20px rgba(255,20,147,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ➕ Nueva Clase
                    </button>
                </div>

                {/* Filtros */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                    {/* CAMBIO 1: fecha se desactiva cuando vista === 'todas' */}
                    <div style={{ flex: 1, minWidth: 160, opacity: vista === 'todas' ? 0.4 : 1 }}>
                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            disabled={vista === 'todas'}
                            style={{ width: '100%', padding: '0.75rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Vista</label>
                        {/* CAMBIO 2: agregada opción "Todas" */}
                        <select value={vista} onChange={e => setVista(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem' }}>
                            <option value="dia">Día</option>
                            <option value="semana">Semana</option>
                            <option value="mes">Mes</option>
                            <option value="todas">Todas</option>
                        </select>
                    </div>

                    <button onClick={handleFiltrar} style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>
                        🔍 Filtrar
                    </button>
                </div>

                {/* Tabla */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 20px rgba(255,20,147,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,20,147,0.1)' }}>
                        <tr>
                            {['Clase', 'Instructor', 'Fecha y Hora', 'Capacidad', 'Sala', 'Estado', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#FF1493', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(255,20,147,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {clases.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay clases en este período</td></tr>
                        ) : clases.map(clase => (
                            <tr key={clase.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: clase.tipo_clase?.color || '#FF1493', flexShrink: 0, boxShadow: `0 0 8px ${clase.tipo_clase?.color || '#FF1493'}` }} />
                                        <span style={{ color: '#fff', fontWeight: 700 }}>{clase.tipo_clase?.nombre || '-'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc' }}>{clase.instructor?.name || '-'}</td>
                                <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem' }}>
                                    <div>{formatDate(clase.fecha_hora_inicio)}</div>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>→ {formatDate(clase.fecha_hora_fin)}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ color: '#FF1493', fontWeight: 700 }}>{clase.total_reservas ?? 0} / {clase.capacidad_maxima}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{clase.cupos_disponibles ?? clase.capacidad_maxima} disponibles</div>
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc' }}>{clase.sala || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: `${estadoColor[clase.estado]}22`, color: estadoColor[clase.estado], border: `1px solid ${estadoColor[clase.estado]}`, padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                                        {estadoLabel[clase.estado]}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {/* CAMBIO 3: botón editar oculto si clase está finalizada */}
                                        {clase.estado !== 'finalizada' && (
                                            <button onClick={() => openEditModal(clase)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '0.5rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }} title="Editar">✏️</button>
                                        )}
                                        <button onClick={() => handleDelete(clase)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '0.5rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }} title="Eliminar">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal — sin cambios */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={closeModal}>
                        <div style={{ background: 'rgba(10,10,10,0.98)', border: '2px solid #FF1493', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 40px rgba(255,20,147,0.5)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,20,147,0.3)' }}>
                                <h2 style={{ color: '#FF1493', fontWeight: 900, margin: 0, fontSize: '1.5rem' }}>{editingClase ? 'Editar Clase' : 'Nueva Clase'}</h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    { label: 'Tipo de Clase *', key: 'tipo_clase_id', type: 'select', options: tiposClase, optLabel: 'nombre', placeholder: '-- Seleccionar tipo --' },
                                    { label: 'Instructor *', key: 'instructor_id', type: 'select', options: instructores, optLabel: 'name', placeholder: '-- Seleccionar instructor --' },
                                ].map(({ label, key, type, options, optLabel, placeholder }) => (
                                    <div key={key}>
                                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
                                        <select value={data[key]} onChange={e => setData(key, e.target.value)} required
                                                style={{ width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: data[key] ? '#fff' : '#666', fontSize: '0.875rem' }}>
                                            <option value="">{placeholder}</option>
                                            {options.map(o => <option key={o.id} value={o.id}>{o[optLabel]}</option>)}
                                        </select>
                                        {errors[key] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors[key]}</p>}
                                    </div>
                                ))}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {[
                                        { label: 'Inicio *', key: 'fecha_hora_inicio' },
                                        { label: 'Fin *', key: 'fecha_hora_fin' },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
                                            <input type="datetime-local" value={data[key]} onChange={e => setData(key, e.target.value)} required
                                                   style={{ width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem' }} />
                                            {errors[key] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors[key]}</p>}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Capacidad Máxima *</label>
                                        <input type="number" value={data.capacidad_maxima} onChange={e => setData('capacidad_maxima', e.target.value)} required min={1}
                                               style={{ width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem' }} />
                                        {errors.capacidad_maxima && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.capacidad_maxima}</p>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Sala</label>
                                        <input type="text" value={data.sala} onChange={e => setData('sala', e.target.value)} placeholder="Ej: Sala Principal"
                                               style={{ width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem' }} />
                                        {errors.sala && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.sala}</p>}
                                    </div>
                                </div>
                                {editingClase && (
                                    <div>
                                        <label style={{ display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Estado</label>
                                        <select value={data.estado} onChange={e => setData('estado', e.target.value)}
                                                style={{ width: '100%', padding: '0.875rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem' }}>
                                            <option value="programada">Programada</option>
                                            <option value="en_curso">En Curso</option>
                                            <option value="finalizada">Finalizada</option>
                                            <option value="cancelada">Cancelada</option>
                                        </select>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,20,147,0.3)' }}>
                                    <button type="button" onClick={closeModal} style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid rgba(255,20,147,0.3)', color: '#FF1493', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                    <button type="submit" disabled={processing} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>
                                        {processing ? 'Guardando...' : 'Guardar Clase'}
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

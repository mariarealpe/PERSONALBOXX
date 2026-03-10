// ════════════════════════════════════════════════════════════
// PASO 7 — CREAR LA PÁGINA DE ASISTENCIAS
// ════════════════════════════════════════════════════════════
//
// Crea el archivo NUEVO:
//   resources/js/Pages/Instructor/Asistencias.jsx
// ────────────────────────────────────────────────────────────

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstructorLayout from '@/Layouts/InstructorLayout';

export default function InstructorAsistencias({ user, clases, claseSeleccionada, asistencias, reservas, filters }) {

    const [fecha,    setFecha]    = useState(filters?.fecha ?? new Date().toISOString().split('T')[0]);
    const [busqueda, setBusqueda] = useState('');
    const [flash,    setFlash]    = useState(null);

    const estadoConfig = {
        programada: { color: '#3b82f6', label: 'Programada' },
        en_curso:   { color: '#22c55e', label: 'En Curso'   },
        finalizada: { color: '#6b7280', label: 'Finalizada' },
        cancelada:  { color: '#ef4444', label: 'Cancelada'  },
    };

    const hora = (dt) => dt
        ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        : '';

    // Seleccionar una clase del listado
    const seleccionarClase = (claseId) => {
        router.get('/instructor/asistencias', { clase_id: claseId, fecha }, { preserveState: false });
    };

    // Cambiar fecha → recarga la lista de clases
    const cambiarFecha = (nuevaFecha) => {
        setFecha(nuevaFecha);
        router.get('/instructor/asistencias', { fecha: nuevaFecha }, { preserveState: false });
    };

    // Registrar asistencia
    const registrar = (clienteId) => {
        router.post('/instructor/asistencias',
            { clase_id: claseSeleccionada?.id, cliente_id: clienteId },
            {
                preserveState: true,
                onSuccess: () => {
                    setFlash({ type: 'success', msg: 'Asistencia registrada ✓' });
                    setTimeout(() => setFlash(null), 3000);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Error al registrar';
                    setFlash({ type: 'error', msg });
                    setTimeout(() => setFlash(null), 3000);
                },
            }
        );
    };

    // Eliminar asistencia
    const eliminar = (asistenciaId) => {
        if (!confirm('¿Eliminar esta asistencia?')) return;
        router.delete(`/instructor/asistencias/${asistenciaId}`, { preserveState: false });
    };

    const asistioMap    = new Set((asistencias ?? []).map(a => a.cliente_id));
    const reservasFilt  = (reservas ?? []).filter(r =>
        !busqueda || r.cliente?.name?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const inp = {
        background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(6,182,212,0.3)',
        borderRadius: 8, color: '#fff', padding: '0.625rem 1rem',
        fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box',
    };

    return (
        <InstructorLayout user={user}>
            <Head title="Asistencias" />

            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* Título */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#06b6d4', margin: '0 0 0.5rem', textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>
                        ✅ Asistencias
                    </h1>
                    <p style={{ color: '#999', margin: 0 }}>Registra la asistencia de tus alumnos</p>
                </div>

                {/* Flash */}
                {flash && (
                    <div style={{ background: flash.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `2px solid ${flash.type === 'success' ? '#22c55e' : '#ef4444'}`, borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: flash.type === 'success' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {flash.msg}
                    </div>
                )}

                {/* Selector de fecha */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                        📅 Fecha:
                    </label>
                    <input type="date" value={fecha} onChange={e => cambiarFecha(e.target.value)} style={{ ...inp, width: 'auto' }} />
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>
                        {clases?.length ?? 0} clase(s) encontrada(s)
                    </span>
                </div>

                {/* Layout dos columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                    {/* ── Columna izquierda: lista de clases ── */}
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 20px rgba(6,182,212,0.1)' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '2px solid rgba(6,182,212,0.2)' }}>
                            <h3 style={{ color: '#06b6d4', fontWeight: 900, margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Clases del día
                            </h3>
                        </div>

                        {clases && clases.length > 0 ? clases.map(clase => {
                            const cfg    = estadoConfig[clase.estado] ?? estadoConfig.programada;
                            const activa = claseSeleccionada?.id === clase.id;
                            return (
                                <div
                                    key={clase.id}
                                    onClick={() => seleccionarClase(clase.id)}
                                    style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(6,182,212,0.1)', cursor: 'pointer', background: activa ? 'rgba(6,182,212,0.1)' : 'transparent', borderLeft: activa ? '4px solid #06b6d4' : '4px solid transparent', transition: 'all 0.2s' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: clase.tipo_clase?.color ?? '#06b6d4', flexShrink: 0 }} />
                                        <span style={{ color: activa ? '#06b6d4' : '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                            {clase.tipo_clase?.nombre}
                                        </span>
                                    </div>
                                    <p style={{ color: '#999', margin: '0 0 0.35rem', fontSize: '0.8rem' }}>
                                        {hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)} · {clase.sala ?? ''}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#666', fontSize: '0.75rem' }}>
                                            👥 {clase.total_reservas ?? 0}/{clase.capacidad_maxima}
                                        </span>
                                        <span style={{ color: cfg.color, fontSize: '0.7rem', fontWeight: 700 }}>{cfg.label}</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>Sin clases para esta fecha</p>
                            </div>
                        )}
                    </div>

                    {/* ── Columna derecha: registro de asistencia ── */}
                    <div>
                        {claseSeleccionada ? (
                            <>
                                {/* Resumen de la clase */}
                                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h2 style={{ color: '#06b6d4', fontWeight: 900, margin: '0 0 0.25rem', fontSize: '1.25rem' }}>
                                            {claseSeleccionada.tipo_clase?.nombre}
                                        </h2>
                                        <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>
                                            {hora(claseSeleccionada.fecha_hora_inicio)} – {hora(claseSeleccionada.fecha_hora_fin)} · {claseSeleccionada.sala}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ color: '#22c55e', fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>{asistencias?.length ?? 0}</p>
                                            <p style={{ color: '#666', fontSize: '0.7rem', margin: 0, textTransform: 'uppercase' }}>Asistieron</p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ color: '#06b6d4', fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>{reservas?.length ?? 0}</p>
                                            <p style={{ color: '#666', fontSize: '0.7rem', margin: 0, textTransform: 'uppercase' }}>Reservas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Buscador */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar alumno por nombre..."
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                        style={inp}
                                    />
                                </div>

                                {/* Lista alumnos */}
                                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem 1.25rem', borderBottom: '2px solid rgba(6,182,212,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ color: '#06b6d4', fontWeight: 900, margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Alumnos con Reserva
                                        </h3>
                                        <span style={{ color: '#666', fontSize: '0.8rem' }}>{reservasFilt.length} alumnos</span>
                                    </div>

                                    {reservasFilt.length > 0 ? reservasFilt.map(reserva => {
                                        const asistio      = asistioMap.has(reserva.cliente_id);
                                        const asistenciaObj = (asistencias ?? []).find(a => a.cliente_id === reserva.cliente_id);
                                        return (
                                            <div key={reserva.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(6,182,212,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: asistio ? 'rgba(34,197,94,0.03)' : 'transparent' }}>
                                                {/* Avatar + nombre */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: asistio ? 'rgba(34,197,94,0.15)' : 'rgba(6,182,212,0.1)', border: `2px solid ${asistio ? '#22c55e' : 'rgba(6,182,212,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: asistio ? '#22c55e' : '#06b6d4', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>
                                                        {reserva.cliente?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{reserva.cliente?.name}</p>
                                                        <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>{reserva.cliente?.email}</p>
                                                    </div>
                                                </div>
                                                {/* Acciones */}
                                                <div>
                                                    {asistio ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>✓ Asistió</span>
                                                            {claseSeleccionada.estado !== 'finalizada' && (
                                                                <button
                                                                    onClick={() => eliminar(asistenciaObj?.id)}
                                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => registrar(reserva.cliente_id)}
                                                            disabled={claseSeleccionada.estado === 'finalizada' || claseSeleccionada.estado === 'cancelada'}
                                                            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: 6, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', opacity: (claseSeleccionada.estado === 'finalizada' || claseSeleccionada.estado === 'cancelada') ? 0.5 : 1 }}
                                                        >
                                                            ✅ Registrar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                                            <p style={{ color: '#666', margin: 0 }}>
                                                {busqueda ? 'No se encontró ningún alumno con ese nombre.' : 'No hay alumnos reservados en esta clase.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>← Selecciona una clase para gestionar asistencias</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </InstructorLayout>
    );
}

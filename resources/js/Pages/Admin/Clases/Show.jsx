import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

const C = '#FF1493';

const ESTADO = {
    confirmada: { label: 'Confirmada',      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: '✓' },
    en_espera:  { label: 'En lista espera', color: '#eab308', bg: 'rgba(234,179,8,0.1)',   icon: '⏳' },
    cancelada:  { label: 'Cancelada',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '✕' },
    completada: { label: 'Completada',      color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '●' },
};

const ESTADO_CLASE = {
    programada: { color: '#3b82f6', label: 'Programada' },
    en_curso:   { color: '#22c55e', label: 'En curso'   },
    finalizada: { color: '#6b7280', label: 'Finalizada' },
    cancelada:  { color: '#ef4444', label: 'Cancelada'  },
};

function Stat({ label, value, color }) {
    return (
        <div style={{
            position: 'relative', overflow: 'hidden', textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 12, padding: '1rem 1.25rem',
            boxShadow: `0 0 20px ${color}14, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.1) 30%,${color}55 50%,rgba(255,255,255,0.1) 70%,transparent)`, pointerEvents:'none' }} />
            <div style={{ color, fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
        </div>
    );
}

export default function ClaseShow({ auth, clase, reservas, resumen }) {

    const fmtFecha = (dt) => dt
        ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '—';
    const fmtHora = (dt) => dt
        ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        : '—';
    const fmtDatetime = (dt) => dt
        ? new Date(dt).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '—';

    const pct      = Math.round((resumen.confirmadas / resumen.capacidad) * 100) || 0;
    const estadoCl = ESTADO_CLASE[clase.estado] ?? ESTADO_CLASE.programada;

    // Agrupar reservas por estado para mostrarlas en secciones
    const grupos = [
        { key: 'confirmada', lista: reservas.filter(r => r.estado === 'confirmada') },
        { key: 'en_espera',  lista: reservas.filter(r => r.estado === 'en_espera')  },
        { key: 'cancelada',  lista: reservas.filter(r => r.estado === 'cancelada')  },
        { key: 'completada', lista: reservas.filter(r => r.estado === 'completada') },
    ].filter(g => g.lista.length > 0);

    const initials = (name) => name
        ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
        : '?';

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Detalle — ${clase.tipo_clase?.nombre ?? 'Clase'}`} />
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Botón volver */}
                <Link
                    href={route('admin.clases.index')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#666', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}
                >
                    ← Volver a clases
                </Link>

                {/* Header de la clase */}
                <div style={{
                    position: 'relative', overflow: 'hidden', marginBottom: '1.5rem',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 16,
                    boxShadow: `0 0 32px ${C}0e, 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
                }}>
                    <div style={{ height: 5, background: clase.tipo_clase?.color ?? C }} />
                    <div style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h1 style={{ color: '#fff', fontWeight: 900, margin: '0 0 0.3rem', fontSize: '1.6rem' }}>
                                    {clase.tipo_clase?.nombre ?? 'Clase'}
                                </h1>
                                <p style={{ color: '#999', margin: '0 0 1rem', fontSize: '0.95rem' }}>
                                    {fmtFecha(clase.fecha_hora_inicio)} · {fmtHora(clase.fecha_hora_inicio)} – {fmtHora(clase.fecha_hora_fin)}
                                </p>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                        {clase.sala ?? 'Sin sala'}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                        {clase.instructor?.name ?? 'Sin instructor'}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                        Capacidad: {clase.capacidad_maxima}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ background: `${estadoCl.color}22`, color: estadoCl.color, border: `1px solid ${estadoCl.color}55`, borderRadius: 20, padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {estadoCl.label}
                                </span>
                                <Link
                                    href={route('admin.clases.index')}
                                    style={{ background: `${C}15`, border: `1px solid ${C}55`, color: C, borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
                                >
                                    ✎ Editar
                                </Link>
                            </div>
                        </div>

                        {/* Barra de ocupación */}
                        <div style={{ marginTop: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#555', fontSize: '0.75rem' }}>Ocupación</span>
                                <span style={{ color: pct >= 100 ? '#ef4444' : pct >= 70 ? '#eab308' : '#22c55e', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {resumen.confirmadas}/{resumen.capacidad} reservados · {pct}% ocupado · {resumen.cupos_libres} libre{resumen.cupos_libres !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div style={{ height: 7, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#ef4444' : pct >= 70 ? '#eab308' : '#22c55e', borderRadius: 4 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats resumen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <Stat label="Confirmadas"   value={resumen.confirmadas} color="#22c55e" />
                    <Stat label="Lista espera"  value={resumen.en_espera}   color="#eab308" />
                    <Stat label="Canceladas"    value={resumen.canceladas}  color="#ef4444" />
                    <Stat label="Completadas"   value={resumen.completadas} color="#6b7280" />
                </div>

                {/* Si no hay ninguna reserva */}
                {reservas.length === 0 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                        border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, padding: '3rem', textAlign: 'center',
                    }}>
                        <p style={{ color: '#555', margin: 0 }}>No hay reservas registradas para esta clase.</p>
                    </div>
                )}

                {/* Secciones por estado */}
                {grupos.map(({ key, lista }) => {
                    const cfg = ESTADO[key];
                    return (
                        <div key={key} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}55`, borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {cfg.icon} {cfg.label}
                                </span>
                                <span style={{ color: '#555', fontSize: '0.8rem' }}>{lista.length} persona{lista.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div style={{
                            overflow: 'hidden', borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: `0 0 20px ${cfg.color}08, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
                        }}>
                                {lista.map((r, idx) => (
                                    <div
                                        key={r.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.875rem 1.25rem',
                                            borderBottom: idx < lista.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${cfg.color}22`, border: `1.5px solid ${cfg.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span style={{ color: cfg.color, fontWeight: 700, fontSize: '0.75rem' }}>
                                                {initials(r.cliente?.name)}
                                            </span>
                                        </div>

                                        {/* Nombre y email */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.1rem', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {r.cliente?.name ?? 'Cliente eliminado'}
                                            </p>
                                            <p style={{ color: '#555', margin: 0, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {r.cliente?.email ?? '—'}
                                            </p>
                                        </div>

                                        {/* Posición en espera */}
                                        {key === 'en_espera' && r.posicion_espera && (
                                            <span style={{ color: '#eab308', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                #{r.posicion_espera} en fila
                                            </span>
                                        )}

                                        {/* Fecha reserva */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ color: '#555', margin: 0, fontSize: '0.72rem' }}>Reservado</p>
                                            <p style={{ color: '#888', margin: 0, fontSize: '0.78rem' }}>{fmtDatetime(r.fecha_reserva)}</p>
                                        </div>

                                        {/* Fecha cancelación si aplica */}
                                        {key === 'cancelada' && r.fecha_cancelacion && (
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ color: '#555', margin: 0, fontSize: '0.72rem' }}>Cancelado</p>
                                                <p style={{ color: '#ef4444', margin: 0, fontSize: '0.78rem' }}>{fmtDatetime(r.fecha_cancelacion)}</p>
                                            </div>
                                        )}

                                        {/* Notificado cuando se promovió de la espera */}
                                        {key === 'confirmada' && r.notificado_cupo_at && (
                                            <span style={{ color: '#22c55e', fontSize: '0.7rem', whiteSpace: 'nowrap', background: 'rgba(34,197,94,0.08)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
                                                ↑ Promovido de espera
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

            </div>
        </DashboardLayout>
    );
}

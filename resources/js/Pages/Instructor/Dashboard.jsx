import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import InstructorLayout from '@/Layouts/InstructorLayout';

export default function InstructorDashboard({ user, stats, clasesHoy }) {

    const estadoConfig = {
        programada: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Programada' },
        en_curso:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'En Curso'   },
        finalizada: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Finalizada' },
        cancelada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelada'  },
    };

    const fmt  = (n)  => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const hora = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <InstructorLayout user={user}>
            <Head title="Dashboard Instructor" />

            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FF1493', margin: '0 0 0.5rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>
                        ¡Hola, {user.name}!
                    </h1>
                    <p style={{ color: '#999', fontSize: '1rem', margin: 0 }}>Tus clases y alumnos de hoy</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { label: 'Clases Hoy',        value: fmt(stats.clases_hoy),      icon: '📅' },
                        { label: 'Clases esta Semana', value: fmt(stats.clases_semana),   icon: '📊' },
                        { label: 'Alumnos únicos',     value: fmt(stats.total_alumnos),   icon: '👥' },
                        { label: 'Asistencias Hoy',    value: fmt(stats.asistencias_hoy), icon: '✅' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 0 20px rgba(255,20,147,0.1)', transition: 'all 0.3s' }}>
                            <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(255,20,147,0.5))' }}>{s.icon}</span>
                            <div>
                                <p style={{ color: '#999', fontSize: '0.8rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                                <h3 style={{ color: '#FF1493', fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{s.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Clases de hoy */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: '#FF1493', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 1.5rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Mis Clases de Hoy
                    </h2>
                    {clasesHoy && clasesHoy.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {clasesHoy.map(clase => {
                                const cfg = estadoConfig[clase.estado] ?? estadoConfig.programada;
                                return (
                                    <div key={clase.id} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 0 20px rgba(255,20,147,0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: clase.tipo_clase?.color ?? '#FF1493', boxShadow: `0 0 8px ${clase.tipo_clase?.color ?? '#FF1493'}`, flexShrink: 0 }} />
                                            <div>
                                                <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '1rem' }}>{clase.tipo_clase?.nombre ?? 'Clase'}</p>
                                                <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>{hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)} · {clase.sala ?? 'Sin sala'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#999', fontSize: '0.875rem' }}>👥 {clase.total_reservas ?? 0} / {clase.capacidad_maxima}</span>
                                            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>{cfg.label}</span>
                                            {(clase.estado === 'programada' || clase.estado === 'en_curso') && (
                                                <Link href={`/instructor/asistencias?clase_id=${clase.id}`} style={{ background: '#FF1493', color: '#000', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                                    ✅ Asistencia
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: '#666', margin: 0 }}>No tienes clases programadas para hoy.</p>
                        </div>
                    )}
                </div>

                {/* Acciones rápidas */}
                <div>
                    <h2 style={{ color: '#FF1493', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 1.5rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Acciones Rápidas
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        {[
                            { icon: '✅', label: 'Registrar Asistencia', href: '/instructor/asistencias' },
                            { icon: '📅', label: 'Ver Mis Clases',        href: '/instructor/clases'      },
                            { icon: '💰', label: 'Mi Liquidación',        href: '/instructor/liquidacion' },
                        ].map(a => (
                            <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                                <div style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '1.5rem 1rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', fontSize: '1rem' }}>
                                    <span style={{ fontSize: '2rem' }}>{a.icon}</span>
                                    <span>{a.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </InstructorLayout>
    );
}

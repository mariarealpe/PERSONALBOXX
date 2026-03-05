import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';

export default function ReportesIndex({ auth, stats, clasesPopulares, asistenciaPorDia }) {
    const fmt = (n) => new Intl.NumberFormat('es-CO').format(n);
    const boxStyle = { background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 0 20px rgba(255,20,147,0.1)' };

    const statCards = [
        { label: 'Clases Hoy', value: stats.clases_hoy, icon: '📅' },
        { label: 'Clases Semana', value: stats.clases_semana, icon: '📊' },
        { label: 'Clases Mes', value: stats.clases_mes, icon: '🗓️' },
        { label: 'Total Clientes', value: stats.total_clientes, icon: '👥' },
        { label: 'Instructores', value: stats.total_instructores, icon: '👨‍🏫' },
        { label: 'Asistencias Hoy', value: stats.asistencias_hoy, icon: '✅' },
        { label: 'Asistencias Semana', value: stats.asistencias_semana, icon: '📈' },
        { label: 'Asistencias Mes', value: stats.asistencias_mes, icon: '🏋️' },
    ];

    const maxAsist = Math.max(...asistenciaPorDia.map(d => d.total), 1);

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Reportes y Estadísticas" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>REPORTES</h1>
                    <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Estadísticas y reportes del gimnasio</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {statCards.map(s => (
                        <div key={s.label} style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s' }}>
                            <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 8px rgba(255,20,147,0.5))' }}>{s.icon}</span>
                            <div>
                                <div style={{ color: '#FF1493', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>{fmt(s.value)}</div>
                                <div style={{ color: '#999', fontSize: '0.75rem', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Asistencia por día */}
                    <div style={boxStyle}>
                        <h2 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 1.5rem', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: 2 }}>Asistencia Esta Semana</h2>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 150 }}>
                            {asistenciaPorDia.map(d => (
                                <div key={d.fecha} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#FF1493', fontSize: '0.8rem', fontWeight: 700 }}>{d.total}</span>
                                    <div style={{ width: '100%', background: `rgba(255,20,147,${0.2 + (d.total / maxAsist) * 0.8})`, borderRadius: '4px 4px 0 0', height: `${Math.max((d.total / maxAsist) * 100, 4)}%`, border: '1px solid rgba(255,20,147,0.5)', transition: 'all 0.3s' }} />
                                    <span style={{ color: '#999', fontSize: '0.75rem' }}>{d.dia}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clases más populares */}
                    <div style={boxStyle}>
                        <h2 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 1.5rem', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: 2 }}>Clases Más Populares</h2>
                        {clasesPopulares.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Sin datos este mes</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {clasesPopulares.map((c, i) => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#0a0a0a', borderRadius: 8 }}>
                                        <span style={{ color: '#FF1493', fontWeight: 900, fontSize: '1.25rem', minWidth: 24 }}>{i + 1}</span>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || '#FF1493', flexShrink: 0 }} />
                                        <span style={{ color: '#fff', fontWeight: 700, flex: 1 }}>{c.tipo_clase?.nombre}</span>
                                        <span style={{ color: '#FF1493', fontWeight: 900 }}>{c.asistencias_count} asist.</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <Link href={route('admin.reportes.asistencia-clase')} style={{ textDecoration: 'none' }}>
                        <div style={{ ...boxStyle, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '2px solid rgba(59,130,246,0.3)' }}>
                            <span style={{ fontSize: '3rem' }}>📋</span>
                            <div>
                                <h3 style={{ color: '#3b82f6', fontWeight: 900, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Reporte por Clase</h3>
                                <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>Ver asistencia detallada de cada clase por período</p>
                            </div>
                        </div>
                    </Link>
                    <Link href={route('admin.reportes.liquidacion')} style={{ textDecoration: 'none' }}>
                        <div style={{ ...boxStyle, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '2px solid rgba(34,197,94,0.3)' }}>
                            <span style={{ fontSize: '3rem' }}>💰</span>
                            <div>
                                <h3 style={{ color: '#22c55e', fontWeight: 900, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Liquidación</h3>
                                <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>Calcular pagos de instructores por período</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

// ── Mini gráfica de barras ────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = '#FF1493', height = 120 }) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 24, position: 'relative' }}>
            {data.map((d, i) => {
                const pct = Math.max((d[valueKey] / max) * 100, 2);
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ color, fontSize: '0.7rem', fontWeight: 700 }}>{d[valueKey]}</span>
                        <div title={`${d[labelKey]}: ${d[valueKey]}`} style={{ width: '100%', height: `${pct}%`, background: `linear-gradient(to top, ${color}, ${color}88)`, borderRadius: '3px 3px 0 0', border: `1px solid ${color}66`, transition: 'all 0.3s', minHeight: 3 }} />
                        <span style={{ color: '#666', fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>{d[labelKey]}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Tarjeta de stat ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#FF1493' }) {
    return (
        <div style={{ background: 'rgba(10,10,10,0.95)', border: `2px solid ${color}44`, borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: `0 0 20px ${color}15` }}>
            <span style={{ fontSize: '2rem', filter: `drop-shadow(0 0 8px ${color}88)` }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color, fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>{value}</div>
                <div style={{ color: '#999', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{label}</div>
                {sub && <div style={{ color: '#555', fontSize: '0.65rem', marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function AdminDashboard({ user, stats, asistenciaPorDia, asistenciaPorMes, clasesPopulares, tiposPopulares, horariosDemanda, proximasClases }) {
    const fmt  = (n) => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const box  = (color = '#FF1493') => ({ background: 'rgba(10,10,10,0.95)', border: `2px solid ${color}44`, borderRadius: 12, padding: '1.5rem', boxShadow: `0 0 20px ${color}15` });
    const pink = '#FF1493', blue = '#3b82f6', green = '#22c55e', amber = '#f59e0b';

    const quickActions = [
        { label: 'Clases', icon: '📅', href: route('admin.clases.index'), color: pink },
        { label: 'Instructores', icon: '👨‍🏫', href: route('admin.instructores.index'), color: blue },
        { label: 'Clientes', icon: '👥', href: route('admin.clientes.index'), color: green },
        { label: 'Asistencia', icon: '✅', href: route('admin.asistencias.index'), color: amber },
        { label: 'Reportes', icon: '📊', href: route('admin.reportes.index'), color: '#a855f7' },
    ];

    return (
        <DashboardLayout user={user}>
            <Head title="Dashboard Administrador" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* Bienvenida */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: pink, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>
                        ¡Bienvenido, {user.name.split(' ')[0]}!
                    </h1>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Panel de Administración — Personal Box Armenia</p>
                </div>

                {/* Acciones rápidas */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {quickActions.map(a => (
                        <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `${a.color}15`, border: `2px solid ${a.color}55`, color: a.color, padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                 onMouseOver={e => e.currentTarget.style.background = `${a.color}30`}
                                 onMouseOut={e => e.currentTarget.style.background = `${a.color}15`}>
                                <span>{a.icon}</span><span>{a.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Stats principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <StatCard icon="👥" label="Total Clientes" value={fmt(stats.total_clientes)} color={pink} />
                    <StatCard icon="👨‍🏫" label="Instructores" value={fmt(stats.total_instructores)} color={blue} />
                    <StatCard icon="📅" label="Clases Hoy" value={fmt(stats.clases_hoy)} sub={`${fmt(stats.clases_semana)} esta semana`} color={pink} />
                    <StatCard icon="✅" label="Asistencias Hoy" value={fmt(stats.asistencias_hoy)} sub={`${fmt(stats.asistencias_semana)} esta semana`} color={green} />
                    <StatCard icon="📋" label="Reservas Hoy" value={fmt(stats.reservas_hoy)} color={amber} />
                    <StatCard icon="🎯" label="Ocupación Mes" value={`${stats.tasa_ocupacion_mes}%`} sub="Tasa promedio" color={stats.tasa_ocupacion_mes >= 70 ? green : stats.tasa_ocupacion_mes >= 40 ? amber : '#ef4444'} />
                    <StatCard icon="🏋️" label="Asistencias Mes" value={fmt(stats.asistencias_mes)} sub={`${fmt(stats.clases_mes)} clases`} color={pink} />
                    <StatCard icon="🔥" label="Clientes Activos" value={fmt(stats.clientes_activos_mes)} sub="Este mes" color={blue} />
                </div>

                {/* Fila: gráficas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                    {/* Asistencia últimos 7 días */}
                    <div style={box(pink)}>
                        <h2 style={{ color: pink, fontWeight: 900, margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2 }}>📈 Asistencia — Últimos 7 Días</h2>
                        <BarChart data={asistenciaPorDia} valueKey="total" labelKey="dia" color={pink} height={130} />
                    </div>

                    {/* Asistencia últimos 6 meses */}
                    <div style={box(blue)}>
                        <h2 style={{ color: blue, fontWeight: 900, margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2 }}>📊 Tendencia — Últimos 6 Meses</h2>
                        <BarChart data={asistenciaPorMes} valueKey="total" labelKey="mes" color={blue} height={130} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                    {/* Clases más populares */}
                    <div style={box(green)}>
                        <h2 style={{ color: green, fontWeight: 900, margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2 }}>🏆 Clases Populares</h2>
                        {clasesPopulares?.length === 0 ? (
                            <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Sin datos este mes</p>
                        ) : clasesPopulares?.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < clasesPopulares.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <span style={{ color: green, fontWeight: 900, fontSize: '1.1rem', minWidth: 20 }}>{i + 1}</span>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                <span style={{ color: '#ddd', fontWeight: 600, flex: 1, fontSize: '0.85rem' }}>{c.nombre}</span>
                                <span style={{ color: green, fontWeight: 900, fontSize: '0.85rem' }}>{c.asistentes}</span>
                            </div>
                        ))}
                    </div>

                    {/* Horarios de mayor demanda */}
                    <div style={box(amber)}>
                        <h2 style={{ color: amber, fontWeight: 900, margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2 }}>⏰ Horarios Demanda</h2>
                        {horariosDemanda?.length === 0 ? (
                            <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Sin datos este mes</p>
                        ) : (
                            <BarChart data={horariosDemanda} valueKey="total" labelKey="hora" color={amber} height={130} />
                        )}
                    </div>

                    {/* Próximas clases hoy */}
                    <div style={box(pink)}>
                        <h2 style={{ color: pink, fontWeight: 900, margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2 }}>📅 Clases de Hoy</h2>
                        {proximasClases?.length === 0 ? (
                            <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No hay clases programadas hoy</p>
                        ) : proximasClases?.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < proximasClases.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <span style={{ color: pink, fontWeight: 900, fontSize: '0.8rem', minWidth: 36 }}>{c.hora}</span>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#ddd', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                                    <div style={{ color: '#555', fontSize: '0.7rem' }}>{c.instructor}</div>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: c.reservas >= c.capacidad ? '#ef4444' : '#666', whiteSpace: 'nowrap' }}>{c.reservas}/{c.capacidad}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

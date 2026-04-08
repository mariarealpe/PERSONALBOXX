import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

/* ── SVG Icons ─────────────────────────────────────────────────── */
const Ico = {
    users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    trending: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    clipboard:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    target:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    zap:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    star:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    clock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    card:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
};

/* ── BarChart ────────────────────────────────────────────────────── */
function BarChart({ data, valueKey, labelKey, color = '#FF1493', height = 120 }) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height, paddingTop:24, position:'relative' }}>
            {data.map((d, i) => {
                const pct = Math.max((d[valueKey] / max) * 100, 2);
                return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
                        <span style={{ color, fontSize:'0.7rem', fontWeight:700 }}>{d[valueKey]}</span>
                        <div
                            title={`${d[labelKey]}: ${d[valueKey]}`}
                            style={{
                                width:'100%', height:`${pct}%`,
                                background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
                                borderRadius:'3px 3px 0 0',
                                border:`1px solid ${color}55`,
                                boxShadow:`0 0 8px ${color}44`,
                                transition:'all 0.3s', minHeight:3,
                            }}
                        />
                        <span style={{ color:'#555', fontSize:'0.62rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%', textAlign:'center' }}>{d[labelKey]}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── StatCard — glassmorphism ───────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = '#FF1493' }) {
    return (
        <div style={{
            position:'relative', overflow:'hidden',
            background:'rgba(255,255,255,0.04)',
            backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderTop:'1px solid rgba(255,255,255,0.13)',
            borderRadius:14,
            padding:'1.2rem 1.4rem',
            display:'flex', alignItems:'center', gap:'1rem',
            boxShadow:`0 0 24px ${color}12, 0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}>
            {/* Brillo cristal */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, ${color}55 50%, rgba(255,255,255,0.1) 70%, transparent)`, pointerEvents:'none' }} />

            {/* Icono */}
            <div style={{
                width:40, height:40, flexShrink:0,
                color, filter:`drop-shadow(0 0 8px ${color}88)`,
                display:'flex', alignItems:'center', justifyContent:'center',
            }}>
                {icon}
            </div>

            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color, fontSize:'1.7rem', fontWeight:900, lineHeight:1 }}>{value}</div>
                <div style={{ color:'#888', fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:1, marginTop:3 }}>{label}</div>
                {sub && <div style={{ color:'#4a4a4a', fontSize:'0.62rem', marginTop:2 }}>{sub}</div>}
            </div>
        </div>
    );
}

/* ── Función para el estilo glass de las secciones ─────────────── */
const glass = (color = '#FF1493') => ({
    position:'relative', overflow:'hidden',
    background:'rgba(255,255,255,0.03)',
    backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
    border:'1px solid rgba(255,255,255,0.06)',
    borderTop:'1px solid rgba(255,255,255,0.12)',
    borderRadius:16,
    padding:'1.5rem',
    boxShadow:`0 0 28px ${color}0e, 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)`,
});

/* ── SectionTitle ───────────────────────────────────────────────── */
function SectionTitle({ icon, label, color }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem' }}>
            <div style={{ width:16, height:16, color, flexShrink:0, filter:`drop-shadow(0 0 4px ${color}88)` }}>{icon}</div>
            <h2 style={{ color, fontWeight:900, margin:0, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:2 }}>{label}</h2>
        </div>
    );
}

/* ── GlassShineLine ─────────────────────────────────────────────── */
function GlassShineLine({ color }) {
    return (
        <div style={{
            position:'absolute', top:0, left:0, right:0, height:'1px',
            background:`linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 25%, ${color}66 50%, rgba(255,255,255,0.1) 75%, transparent)`,
            pointerEvents:'none',
        }} />
    );
}

/* ── Dashboard principal ────────────────────────────────────────── */
export default function AdminDashboard({ user, stats, asistenciaPorDia, asistenciaPorMes, clasesPopulares, horariosDemanda, proximasClases, clientesMasActivos }) {
    const fmt    = (n) => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const pink   = '#FF1493', blue = '#3b82f6', green = '#22c55e', amber = '#f59e0b', purple = '#a855f7';

    const quickActions = [
        { label:'Clases',       icon: Ico.calendar, href: route('admin.clases.index'),       color: pink   },
        { label:'Instructores', icon: Ico.users,    href: route('admin.instructores.index'), color: blue   },
        { label:'Clientes',     icon: Ico.users,    href: route('admin.clientes.index'),     color: green  },
        { label:'Asistencia',   icon: Ico.check,    href: route('admin.asistencias.index'),  color: amber  },
        { label:'Reportes',     icon: Ico.chart,    href: route('admin.reportes.index'),     color: purple },
    ];

    const ocupColor = stats.tasa_ocupacion_mes >= 70 ? green : stats.tasa_ocupacion_mes >= 40 ? amber : '#ef4444';

    return (
        <DashboardLayout user={user}>
            <Head title="Dashboard Administrador" />

            <div className="dash-wrap">

                {/* ── Bienvenida ── */}
                <div className="section-welcome">
                    <h1 className="welcome-title">
                        Bienvenido, {user.name.split(' ')[0]}
                    </h1>
                    <p className="welcome-sub">Panel de Administración — Personal Box Armenia</p>
                </div>

                {/* ── Acciones rápidas ── */}
                <div className="quick-actions">
                    {quickActions.map(a => (
                        <Link key={a.label} href={a.href} className="qa-btn" style={{ '--qa-color': a.color }} aria-label={a.label}>
                            <span className="qa-icon" style={{ color: a.color }}>{a.icon}</span>
                            <span>{a.label}</span>
                        </Link>
                    ))}
                </div>

                {/* ── Stats principales ── */}
                <div className="stats-grid">
                    <StatCard icon={Ico.users}     label="Total Clientes"   value={fmt(stats.total_clientes)}       color={pink} />
                    <StatCard icon={Ico.users}     label="Instructores"     value={fmt(stats.total_instructores)}   color={blue} />
                    <StatCard icon={Ico.calendar}  label="Clases Hoy"       value={fmt(stats.clases_hoy)}           sub={`${fmt(stats.clases_semana)} esta semana`} color={pink} />
                    <StatCard icon={Ico.check}     label="Asistencias Hoy"  value={fmt(stats.asistencias_hoy)}      sub={`${fmt(stats.asistencias_semana)} esta semana`} color={green} />
                    <StatCard icon={Ico.clipboard} label="Reservas Hoy"     value={fmt(stats.reservas_hoy)}         color={amber} />
                    <StatCard icon={Ico.target}    label="Ocupación Mes"    value={`${stats.tasa_ocupacion_mes}%`}  sub="Tasa promedio" color={ocupColor} />
                    <StatCard icon={Ico.activity}  label="Asistencias Mes"  value={fmt(stats.asistencias_mes)}      sub={`${fmt(stats.clases_mes)} clases`} color={pink} />
                    <StatCard icon={Ico.zap}       label="Clientes Activos" value={fmt(stats.clientes_activos_mes)} sub="Este mes" color={blue} />
                </div>

                {/* ── Gráficas principales ── */}
                <div className="grid-2">
                    <div style={glass(pink)}>
                        <GlassShineLine color={pink} />
                        <SectionTitle icon={Ico.trending} label="Asistencia — Últimos 7 Días" color={pink} />
                        <BarChart data={asistenciaPorDia} valueKey="total" labelKey="dia" color={pink} height={130} />
                    </div>
                    <div style={glass(blue)}>
                        <GlassShineLine color={blue} />
                        <SectionTitle icon={Ico.chart} label="Tendencia — Últimos 6 Meses" color={blue} />
                        <BarChart data={asistenciaPorMes} valueKey="total" labelKey="mes" color={blue} height={130} />
                    </div>
                </div>

                {/* ── Panels secundarios ── */}
                <div className="grid-3">

                    {/* Clases populares */}
                    <div style={glass(green)}>
                        <GlassShineLine color={green} />
                        <SectionTitle icon={Ico.star} label="Clases Populares" color={green} />
                        {!clasesPopulares?.length ? (
                            <p style={{ color:'#555', fontSize:'0.85rem', textAlign:'center', padding:'1rem' }}>Sin datos este mes</p>
                        ) : clasesPopulares.map((c, i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem 0', borderBottom: i < clasesPopulares.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span style={{ color:green, fontWeight:900, fontSize:'1rem', minWidth:20 }}>{i + 1}</span>
                                <div style={{ width:7, height:7, borderRadius:'50%', background:c.color, flexShrink:0, boxShadow:`0 0 6px ${c.color}` }} />
                                <span style={{ color:'#ccc', fontWeight:600, flex:1, fontSize:'0.83rem' }}>{c.nombre}</span>
                                <span style={{ color:green, fontWeight:900, fontSize:'0.83rem' }}>{c.asistentes}</span>
                            </div>
                        ))}
                    </div>

                    {/* Horarios de demanda */}
                    <div style={glass(amber)}>
                        <GlassShineLine color={amber} />
                        <SectionTitle icon={Ico.clock} label="Horarios Demanda" color={amber} />
                        {!horariosDemanda?.length ? (
                            <p style={{ color:'#555', fontSize:'0.85rem', textAlign:'center', padding:'1rem' }}>Sin datos este mes</p>
                        ) : (
                            <BarChart data={horariosDemanda} valueKey="total" labelKey="hora" color={amber} height={130} />
                        )}
                    </div>

                    {/* Clases de hoy */}
                    <div style={glass(pink)}>
                        <GlassShineLine color={pink} />
                        <SectionTitle icon={Ico.calendar} label="Clases de Hoy" color={pink} />
                        {!proximasClases?.length ? (
                            <p style={{ color:'#555', fontSize:'0.85rem', textAlign:'center', padding:'1rem' }}>No hay clases programadas hoy</p>
                        ) : proximasClases.map((c, i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem 0', borderBottom: i < proximasClases.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span style={{ color:pink, fontWeight:900, fontSize:'0.78rem', minWidth:36 }}>{c.hora}</span>
                                <div style={{ width:7, height:7, borderRadius:'50%', background:c.color, flexShrink:0, boxShadow:`0 0 6px ${c.color}` }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ color:'#ddd', fontWeight:700, fontSize:'0.78rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nombre}</div>
                                    <div style={{ color:'#4a4a4a', fontSize:'0.68rem' }}>{c.instructor}</div>
                                </div>
                                <span style={{ fontSize:'0.68rem', color: c.reservas >= c.capacidad ? '#ef4444' : '#555', whiteSpace:'nowrap' }}>{c.reservas}/{c.capacidad}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Clientes más activos ── */}
                <div style={glass(purple)}>
                    <GlassShineLine color={purple} />
                    <SectionTitle icon={Ico.zap} label="Clientes Más Activos — Este Mes" color={purple} />

                    {!clientesMasActivos?.length ? (
                        <p style={{ color:'#555', fontSize:'0.85rem', textAlign:'center', padding:'1rem' }}>Sin asistencias registradas este mes</p>
                    ) : (
                        <div className="clients-grid">
                            {clientesMasActivos.map((c, i) => (
                                <div key={i} style={{
                                    display:'flex', alignItems:'center', gap:'0.875rem',
                                    padding:'0.875rem 1rem', borderRadius:12,
                                    background:'rgba(255,255,255,0.03)',
                                    border:`1px solid ${purple}28`,
                                    backdropFilter:'blur(8px)',
                                    boxShadow:`inset 0 1px 0 rgba(255,255,255,0.06)`,
                                }}>
                                    {/* Posición */}
                                    <div style={{
                                        width:32, height:32, borderRadius:'50%', flexShrink:0,
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        background: i === 0 ? `linear-gradient(135deg,${amber},#ca8a00)` : i === 1 ? 'rgba(148,163,184,0.15)' : i === 2 ? 'rgba(180,83,9,0.15)' : `${purple}18`,
                                        border: `1.5px solid ${i === 0 ? amber : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : purple + '44'}`,
                                        boxShadow: i === 0 ? `0 0 10px ${amber}55` : 'none',
                                    }}>
                                        <span style={{
                                            color: i === 0 ? '#000' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : purple,
                                            fontWeight:900, fontSize:'0.8rem',
                                        }}>
                                            {i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : `${i+1}`}
                                        </span>
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <p style={{ color:'#e5e5e5', fontWeight:700, margin:'0 0 0.1rem', fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nombre}</p>
                                        <p style={{ color:'#444', margin:0, fontSize:'0.7rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.email}</p>
                                    </div>

                                    <div style={{ textAlign:'right', flexShrink:0 }}>
                                        <p style={{ color:purple, fontWeight:900, margin:'0 0 0.1rem', fontSize:'1.05rem' }}>{c.total_asistencias}</p>
                                        <p style={{ color:'#444', margin:0, fontSize:'0.62rem' }}>clases</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <style>{`
                .dash-wrap {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                /* Bienvenida */
                .section-welcome { margin-bottom: 0.25rem; }
                .welcome-title {
                    font-size: clamp(1.6rem, 4vw, 2.4rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 0.25rem;
                    text-shadow: 0 0 12px rgba(255,20,147,0.45);
                }
                .welcome-sub { color: #555; font-size: 0.85rem; margin: 0; }

                /* Acciones rápidas */
                .quick-actions {
                    display: flex;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .qa-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.48rem 1rem;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.82rem;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.22s;
                    color: var(--qa-color);

                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
                }
                .qa-btn:hover {
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.12);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
                }
                .qa-icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .qa-icon svg { width: 100%; height: 100%; }

                /* Grids */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .grid-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1.5rem;
                }
                .clients-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 0.75rem;
                }

                /* ── Responsive — tablet ── */
                @media (max-width: 1100px) {
                    .stats-grid { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 900px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .grid-3 { grid-template-columns: 1fr 1fr; }
                }

                @media (max-width: 700px) {
                    .grid-2 { grid-template-columns: 1fr; }
                    .grid-3 { grid-template-columns: 1fr; }
                }

                /* ── Responsive — móvil ── */
                @media (max-width: 480px) {
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                    .quick-actions { gap: 0.5rem; }
                    .qa-btn { font-size: 0.76rem; padding: 0.4rem 0.75rem; }
                    .clients-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 360px) {
                    .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
}

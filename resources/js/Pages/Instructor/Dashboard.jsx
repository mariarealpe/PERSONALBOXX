import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import InstructorLayout from '@/Layouts/InstructorLayout';

const Ico = {
    calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    money:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H7"/></svg>,
    clock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

function StatCard({ icon, label, value }) {
    return (
        <div className="ins-stat-card">
            <div className="ins-stat-icon">{icon}</div>
            <div>
                <p className="ins-stat-label">{label}</p>
                <h3 className="ins-stat-value">{value}</h3>
            </div>
        </div>
    );
}

export default function InstructorDashboard({ user, stats, clasesHoy }) {
    const [nowTs, setNowTs] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNowTs(Date.now()), 30000);
        return () => clearInterval(id);
    }, []);

    const estadoConfig = {
        programada: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Programada' },
        en_curso:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'En Curso'   },
        finalizada: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Finalizada' },
        cancelada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelada'  },
    };

    const getEstadoVisual = (clase) => {
        const estadoDb = clase?.estado ?? 'programada';
        if (estadoDb === 'cancelada' || estadoDb === 'finalizada') return estadoDb;

        const ini = new Date(clase?.fecha_hora_inicio).getTime();
        const fin = new Date(clase?.fecha_hora_fin).getTime();
        if (Number.isNaN(ini) || Number.isNaN(fin)) return estadoDb;

        if (nowTs >= fin) return 'finalizada';
        if (nowTs >= ini && nowTs < fin) return 'en_curso';
        return 'programada';
    };

    const clasesHoyNormalizadas = useMemo(
        () => (clasesHoy ?? []).map((c) => ({ ...c, estado_visual: getEstadoVisual(c) })),
        [clasesHoy, nowTs]
    );

    const fmt  = (n)  => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const hora = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const statItems = [
        { label: 'Clases Hoy', value: fmt(stats.clases_hoy), icon: Ico.calendar },
        { label: 'Clases esta Semana', value: fmt(stats.clases_semana), icon: Ico.chart },
        { label: 'Alumnos únicos', value: fmt(stats.total_alumnos), icon: Ico.users },
        { label: 'Asistencias Hoy', value: fmt(stats.asistencias_hoy), icon: Ico.check },
    ];

    const quickActions = [
        { icon: Ico.check, label: 'Registrar Asistencia', href: '/instructor/asistencias' },
        { icon: Ico.calendar, label: 'Ver Mis Clases', href: '/instructor/clases' },
        { icon: Ico.money, label: 'Mi Liquidación', href: '/instructor/liquidacion' },
    ];

    return (
        <InstructorLayout user={user}>
            <Head title="Dashboard Instructor" />
            <div className="ins-wrap">
                <div className="ins-welcome">
                    <h1 className="ins-title">¡Hola, {user.name}!</h1>
                    <p className="ins-sub">Tus clases y alumnos de hoy</p>
                </div>

                <div className="ins-stats-grid">
                    {statItems.map((s) => <StatCard key={s.label} {...s} />)}
                </div>

                <div className="ins-section">
                    <h2 className="ins-section-title">Mis Clases de Hoy</h2>
                    {clasesHoyNormalizadas?.length ? (
                        <div className="ins-classes-grid">
                            {clasesHoyNormalizadas.map((clase) => {
                                const cfg = estadoConfig[clase.estado_visual] ?? estadoConfig.programada;
                                return (
                                    <div key={clase.id} className="ins-class-card">
                                        <div className="ins-class-main">
                                            <div
                                                className="ins-class-dot"
                                                style={{ background: clase.tipo_clase?.color ?? '#FF1493', boxShadow: `0 0 10px ${clase.tipo_clase?.color ?? '#FF1493'}` }}
                                            />
                                            <div>
                                                <p className="ins-class-name">{clase.tipo_clase?.nombre ?? 'Clase'}</p>
                                                <p className="ins-class-meta">
                                                    <span className="ins-meta-icon">{Ico.clock}</span>
                                                    {hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)} · {clase.sala ?? 'Sin sala'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ins-class-side">
                                            <span className="ins-cap">
                                                <span className="ins-cap-icon">{Ico.users}</span>
                                                {clase.total_reservas ?? 0} / {clase.capacidad_maxima}
                                            </span>
                                            <span className="ins-status" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                            {(clase.estado_visual === 'programada' || clase.estado_visual === 'en_curso') && (
                                                <Link href={`/instructor/asistencias?clase_id=${clase.id}`} className="ins-btn-primary">
                                                    <span className="ins-btn-icon">{Ico.check}</span>
                                                    Asistencia
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="ins-empty">
                            <p>No tienes clases programadas para hoy.</p>
                        </div>
                    )}
                </div>

                <div className="ins-section">
                    <h2 className="ins-section-title">Acciones Rápidas</h2>
                    <div className="ins-actions-grid">
                        {quickActions.map((a) => (
                            <Link key={a.label} href={a.href} className="ins-action-btn">
                                <span className="ins-action-icon">{a.icon}</span>
                                <span>{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .ins-wrap { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
                .ins-welcome { margin-bottom: .25rem; }
                .ins-title { font-size: clamp(1.6rem, 4vw, 2.3rem); font-weight: 900; color: #FF1493; margin: 0 0 .35rem; text-shadow: 0 0 12px rgba(255,20,147,.45); }
                .ins-sub { color: #777; margin: 0; font-size: .9rem; }

                .ins-section-title { color: #FF1493; font-size: .95rem; font-weight: 900; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 2px; }

                .ins-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
                .ins-stat-card {
                    position: relative; overflow: hidden; border-radius: 14px; padding: 1.1rem 1.2rem; display: flex; align-items: center; gap: .9rem;
                    background: rgba(255,255,255,.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,.07); border-top: 1px solid rgba(255,255,255,.13);
                    box-shadow: 0 0 24px rgba(255,20,147,.1), 0 8px 28px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07);
                }
                .ins-stat-icon { width: 34px; height: 34px; color: #FF1493; flex-shrink: 0; filter: drop-shadow(0 0 8px rgba(255,20,147,.6)); }
                .ins-stat-label { color: #888; font-size: .68rem; margin: 0 0 .2rem; text-transform: uppercase; letter-spacing: 1px; }
                .ins-stat-value { color: #FF1493; font-size: 1.7rem; line-height: 1; margin: 0; font-weight: 900; }

                .ins-classes-grid { display: grid; gap: .9rem; }
                .ins-class-card {
                    background: rgba(255,255,255,.03); border: 1px solid rgba(255,20,147,.28); border-radius: 14px; padding: 1rem 1.1rem;
                    box-shadow: 0 0 20px rgba(255,20,147,.08), inset 0 1px 0 rgba(255,255,255,.06);
                    display: flex; justify-content: space-between; align-items: center; gap: .9rem; flex-wrap: wrap;
                }
                .ins-class-main { display: flex; align-items: center; gap: .8rem; min-width: 0; }
                .ins-class-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
                .ins-class-name { color: #f3f3f3; margin: 0 0 .2rem; font-size: .95rem; font-weight: 700; }
                .ins-class-meta { color: #8a8a8a; margin: 0; font-size: .8rem; display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
                .ins-meta-icon { width: 14px; height: 14px; color: #6f6f6f; display: inline-flex; }

                .ins-class-side { display: flex; align-items: center; gap: .7rem; flex-wrap: wrap; margin-left: auto; }
                .ins-cap { color: #b5b5b5; font-size: .8rem; display: inline-flex; align-items: center; gap: .35rem; }
                .ins-cap-icon { width: 14px; height: 14px; color: #888; display: inline-flex; }
                .ins-status { border: 1px solid; border-radius: 999px; padding: .22rem .65rem; font-size: .72rem; font-weight: 700; }
                .ins-btn-primary {
                    display: inline-flex; align-items: center; gap: .35rem; text-decoration: none;
                    background: #FF1493; color: #000; border-radius: 9px; padding: .45rem .72rem; font-size: .78rem; font-weight: 800;
                }
                .ins-btn-icon { width: 14px; height: 14px; display: inline-flex; }

                .ins-empty {
                    background: rgba(255,255,255,.03); border: 1px solid rgba(255,20,147,.2); border-radius: 14px; padding: 2rem; text-align: center; color: #666;
                }

                .ins-actions-grid { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: .9rem; }
                .ins-action-btn {
                    text-decoration: none; border-radius: 12px; padding: 1rem .9rem; font-weight: 700; font-size: .9rem;
                    display: flex; flex-direction: column; align-items: center; gap: .55rem; text-align: center;
                    color: #FF1493; background: rgba(255,20,147,.08); border: 1px solid rgba(255,20,147,.35);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.07); transition: all .2s ease;
                }
                .ins-action-btn:hover { background: rgba(255,20,147,.14); border-color: rgba(255,20,147,.5); color: #fff; transform: translateY(-1px); }
                .ins-action-icon { width: 24px; height: 24px; }

                @media (max-width: 1100px) { .ins-stats-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 780px) {
                    .ins-actions-grid { grid-template-columns: 1fr 1fr; }
                    .ins-class-side { width: 100%; margin-left: 0; }
                }
                @media (max-width: 520px) {
                    .ins-stats-grid, .ins-actions-grid { grid-template-columns: 1fr; }
                    .ins-class-card { padding: .9rem; }
                    .ins-class-name { font-size: .9rem; }
                    .ins-class-meta, .ins-cap { font-size: .76rem; }
                }
            `}</style>
        </InstructorLayout>
    );
}

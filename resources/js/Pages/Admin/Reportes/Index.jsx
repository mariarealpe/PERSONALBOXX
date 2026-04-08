import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';

function Icon({ name }) {
    const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const map = {
        calendario: <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
        barras: <svg {...common}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
        clientes: <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        instructor: <svg {...common}><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>,
        check: <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>,
        fitness: <svg {...common}><path d="M6 8l4 4-4 4"/><path d="M18 8l-4 4 4 4"/></svg>,
        reporte: <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
        liquidacion: <svg {...common}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>,
    };
    return map[name] || null;
}

export default function ReportesIndex({ auth, stats, clasesPopulares, asistenciaPorDia }) {
    const fmt = (n) => new Intl.NumberFormat('es-CO').format(n);

    const statCards = [
        { label: 'Clases Hoy', value: stats.clases_hoy, icon: 'calendario' },
        { label: 'Clases Semana', value: stats.clases_semana, icon: 'barras' },
        { label: 'Clases Mes', value: stats.clases_mes, icon: 'calendario' },
        { label: 'Total Clientes', value: stats.total_clientes, icon: 'clientes' },
        { label: 'Instructores', value: stats.total_instructores, icon: 'instructor' },
        { label: 'Asistencias Hoy', value: stats.asistencias_hoy, icon: 'check' },
        { label: 'Asistencias Semana', value: stats.asistencias_semana, icon: 'barras' },
        { label: 'Asistencias Mes', value: stats.asistencias_mes, icon: 'fitness' },
    ];

    const maxAsist = Math.max(...asistenciaPorDia.map(d => d.total), 1);

    const boxStyle = {
        background: 'rgba(10,10,10,0.95)',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 0 20px rgba(255,20,147,0.1)',
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Reportes y Estadísticas" />
            <div className="rep-wrap">
                <div className="rep-head">
                    <h1 className="rep-title">REPORTES</h1>
                    <p className="rep-sub">Estadísticas y reportes del gimnasio</p>
                </div>

                <div className="rep-stats">
                    {statCards.map(s => (
                        <div key={s.label} className="rep-card glass-card">
                            <span className="rep-icon"><Icon name={s.icon} /></span>
                            <div>
                                <div className="rep-value">{fmt(s.value)}</div>
                                <div className="rep-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rep-grid-2">
                    <div className="glass-card section">
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

                    <div className="glass-card section">
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

                <div className="rep-grid-links">
                    <Link href={route('admin.reportes.asistencia-clase')} style={{ textDecoration: 'none' }}>
                        <div style={{ ...boxStyle, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '2px solid rgba(255,20,147,0.35)' }}>
                            <span className="rep-link-icon"><Icon name="reporte" /></span>
                            <div>
                                <h3 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Reporte por Clase</h3>
                                <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>Ver asistencia detallada de cada clase por período</p>
                            </div>
                        </div>
                    </Link>
                    <Link href={route('admin.reportes.liquidacion')} style={{ textDecoration: 'none' }}>
                        <div style={{ ...boxStyle, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '2px solid rgba(255,20,147,0.35)' }}>
                            <span className="rep-link-icon"><Icon name="liquidacion" /></span>
                            <div>
                                <h3 style={{ color: '#FF1493', fontWeight: 900, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Liquidación</h3>
                                <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>Calcular pagos de instructores por período</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <style>{`
                .rep-wrap { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
                .rep-head { margin-bottom: .25rem; }
                .rep-title { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; color: #FF1493; margin: 0; text-shadow: 0 0 12px rgba(255,20,147,.45); }
                .rep-sub { color: #777; margin: .35rem 0 0; font-size: .85rem; }

                .glass-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    box-shadow: 0 0 28px rgba(255,20,147,0.08), 0 8px 32px rgba(0,0,0,0.45);
                }

                .rep-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
                .rep-card { padding: 1rem 1.1rem; display: flex; align-items: center; gap: .9rem; }
                .rep-icon { color: #FF1493; display: inline-flex; }
                .rep-value { color: #FF1493; font-size: 1.5rem; font-weight: 900; line-height: 1; }
                .rep-label { color: #888; font-size: .72rem; margin-top: .25rem; text-transform: uppercase; letter-spacing: 1px; }

                .rep-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .section { padding: 1.2rem; }
                .rep-grid-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 1rem; }
                .rep-link-icon { color: #FF1493; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; }
                .rep-link-icon svg { width: 34px; height: 34px; }

                @media (max-width: 900px) { .rep-grid-2 { grid-template-columns: 1fr; } }
                @media (max-width: 768px) { .section { padding: 1rem; } }
            `}</style>
        </DashboardLayout>
    );
}

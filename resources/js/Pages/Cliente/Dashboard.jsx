import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ClienteLayout from '@/Layouts/ClienteLayout';

export default function ClienteDashboard({ user, stats, proximasClases }) {
    const C = '#FF1493';
    const fmt      = (n)  => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO',  { hour: '2-digit', minute: '2-digit' }) : '';
    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO',  { weekday: 'short', day: 'numeric', month: 'short' }) : '';

    // Redondear días para evitar decimales como "29.144..."
    const dias = Math.floor(stats.plan_actual?.dias_restantes ?? 0);
    const colorPlan = dias <= 5 ? '#ef4444' : dias <= 10 ? '#eab308' : '#22c55e';

    const Ico = {
      list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>,
      gym: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6v12"/><path d="M18 6v12"/><path d="M3 9h3"/><path d="M18 9h3"/><path d="M3 15h3"/><path d="M18 15h3"/><path d="M9 12h6"/></svg>,
      card: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
      check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 6L9 17l-5-5"/></svg>,
      chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    };

    return (
        <ClienteLayout user={user}>
            <Head title="Dashboard" />
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: C, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>
                        ¡Hola, {user.name}!
                    </h1>
                    <p style={{ color: '#999', margin: 0 }}>Bienvenido a tu portal Personal Box</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { icon: Ico.list, label: 'Reservas Activas', value: fmt(stats.reservas_activas) },
                        { icon: Ico.gym,  label: 'Clases Tomadas',   value: fmt(stats.clases_tomadas)   },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <span style={{ width: '2.5rem', height: '2.5rem', display: 'inline-flex', color: C }}>{s.icon}</span>
                            <div>
                                <p style={{ color: '#999', fontSize: '0.75rem', margin: '0 0 0.3rem', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                                <h3 style={{ color: C, fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>{s.value}</h3>
                            </div>
                        </div>
                    ))}

                    {/* Card plan */}
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ width: '2.5rem', height: '2.5rem', display: 'inline-flex', color: C }}>{Ico.card}</span>
                        <div>
                            <p style={{ color: '#999', fontSize: '0.75rem', margin: '0 0 0.3rem', textTransform: 'uppercase', letterSpacing: 1 }}>Mi Plan</p>
                            {stats.plan_actual ? (
                                <>
                                    <h3 style={{ color: C, fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.2rem' }}>{stats.plan_actual.nombre}</h3>
                                    <p style={{ color: colorPlan, fontSize: '0.8rem', margin: 0, fontWeight: 700 }}>
                                        {dias > 0 ? `Vence en ${dias} días` : 'Vencido'}
                                    </p>
                                </>
                            ) : (
                                <h3 style={{ color: '#555', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Sin plan activo</h3>
                            )}
                        </div>
                    </div>
                </div>

                {/* Próximas clases */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: C, fontSize: '1.3rem', fontWeight: 900, margin: '0 0 1.5rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Mis Próximas Clases
                    </h2>
                    {proximasClases && proximasClases.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {proximasClases.map(r => (
                                <div key={r.id} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: r.clase?.tipo_clase?.color ?? C, flexShrink: 0 }} />
                                        <div>
                                            <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.2rem' }}>{r.clase?.tipo_clase?.nombre}</p>
                                            <p style={{ color: '#999', margin: 0, fontSize: '0.85rem' }}>
                                                {fmtFecha(r.clase?.fecha_hora_inicio)} · {hora(r.clase?.fecha_hora_inicio)} – {hora(r.clase?.fecha_hora_fin)}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{ display:'inline-flex', width:14, height:14 }}>{Ico.check}</span> Confirmada
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: '#666', margin: '0 0 1rem' }}>No tienes clases reservadas próximamente.</p>
                            <Link href="/cliente/clases" style={{ background: C, color: '#fff', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, textDecoration: 'none' }}>
                              <span style={{ width:14, height:14, display:'inline-flex', marginRight:6 }}>{Ico.gym}</span>
                              Ver Clases Disponibles
                            </Link>
                        </div>
                    )}
                </div>

                {/* Acciones rápidas */}
                <div>
                    <h2 style={{ color: C, fontSize: '1.3rem', fontWeight: 900, margin: '0 0 1.5rem', textTransform: 'uppercase', letterSpacing: 2 }}>Acciones Rápidas</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                        {[
                            { icon: Ico.gym,  label: 'Reservar Clase', href: '/cliente/clases'    },
                            { icon: Ico.list, label: 'Mis Reservas',   href: '/cliente/reservas'  },
                            { icon: Ico.chart,label: 'Mi Historial',   href: '/cliente/historial' },
                            { icon: Ico.card, label: 'Mi Plan',        href: '/cliente/mi-plan'   },
                        ].map(a => (
                            <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                                <div style={{ background: 'rgba(255,20,147,0.1)', border: `2px solid ${C}`, color: C, padding: '1.5rem 1rem', borderRadius: 12, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' }}
                                     onMouseOver={e => e.currentTarget.style.background = 'rgba(255,20,147,0.2)'}
                                     onMouseOut={e => e.currentTarget.style.background = 'rgba(255,20,147,0.1)'}
                                >
                                    <span style={{ width: '2rem', height: '2rem', display: 'inline-flex', color: C }}>{a.icon}</span>
                                    <span>{a.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </ClienteLayout>
    );
}

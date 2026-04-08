import { Head, usePage } from '@inertiajs/react';
import ClienteLayout from '@/Layouts/ClienteLayout';

const Ico = {
  card:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
};

export default function ClienteMiPlan({ user, planActivo, historialPlanes }) {
    const C = '#FF1493';
    const { props } = usePage();
    const flash = props.flash ?? {};

    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const fmtPrecio = (n) => n != null ? `$${new Intl.NumberFormat('es-CO').format(n)}` : '—';

    const tipoPlanConfig = {
        adultos_activos: { color: '#06b6d4', label: 'Adultos Activos' },
        membresia:       { color: '#FF1493', label: 'Membresía'        },
        premium:         { color: '#eab308', label: 'Premium'          },
        personalizado:   { color: '#f97316', label: 'Personalizado'    },
    };

    const estadoConfig = {
        activo:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Activo'   },
        vencido:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Vencido'  },
        cancelado:{ color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Cancelado'},
    };

    // Math.floor para mostrar siempre número entero
    const dias = Math.floor(planActivo?.dias_restantes ?? 0);
    const colorDias = dias <= 5 ? '#ef4444' : dias <= 10 ? '#eab308' : '#22c55e';

    return (
        <ClienteLayout user={user}>
            <Head title="Mi Plan" />
            <div style={{ maxWidth: 800, margin: '0 auto' }}>

                {flash.error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.45)',
                        color: '#f87171',
                        borderRadius: 10,
                        padding: '0.9rem 1rem',
                        marginBottom: '1rem',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                    }}>
                        {flash.error}
                    </div>
                )}

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>
                      <span style={{width:22,height:22,display:'inline-flex',marginRight:8}}>{Ico.card}</span>
                      Mi Plan
                    </h1>
                    <p style={{ color: '#999', margin: 0 }}>Tu membresía activa y el historial de planes</p>
                </div>

                {/* Plan activo */}
                {planActivo ? (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: `2px solid ${C}`, borderRadius: 16, padding: '2rem', marginBottom: '2rem', boxShadow: `0 0 30px rgba(255,20,147,0.2)` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <span style={{ background: 'rgba(255,20,147,0.15)', color: C, border: `1px solid ${C}`, borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Plan Activo
                                    </span>
                                    {planActivo.plan?.tipo_plan && (
                                        <span style={{ background: `${(tipoPlanConfig[planActivo.plan.tipo_plan]?.color ?? C)}22`, color: tipoPlanConfig[planActivo.plan.tipo_plan]?.color ?? C, border: `1px solid ${tipoPlanConfig[planActivo.plan.tipo_plan]?.color ?? C}`, borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 700 }}>
                                            {tipoPlanConfig[planActivo.plan.tipo_plan]?.label}
                                        </span>
                                    )}
                                </div>
                                <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>{planActivo.plan?.nombre}</h2>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: '#999', fontSize: '0.75rem', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Precio</p>
                                <p style={{ color: C, fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>{fmtPrecio(planActivo.plan?.precio)}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1rem' }}>
                                <p style={{ color: '#666', fontSize: '0.7rem', margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Fecha de inicio</p>
                                <p style={{ color: '#ccc', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{fmtFecha(planActivo.fecha_inicio)}</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1rem' }}>
                                <p style={{ color: '#666', fontSize: '0.7rem', margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Fecha de vencimiento</p>
                                <p style={{ color: '#ccc', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{fmtFecha(planActivo.fecha_vencimiento)}</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1rem' }}>
                                <p style={{ color: '#666', fontSize: '0.7rem', margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Días restantes</p>
                                <p style={{ color: colorDias, fontWeight: 900, margin: 0, fontSize: '1.5rem' }}>
                                    {dias > 0 ? dias : 'Vencido'}
                                </p>
                            </div>
                        </div>

                        {/* Barra de tiempo */}
                        {planActivo.fecha_inicio && planActivo.fecha_vencimiento && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#666', fontSize: '0.7rem' }}>Progreso del plan</span>
                                    <span style={{ color: colorDias, fontSize: '0.7rem', fontWeight: 700 }}>
                                        {Math.max(0, Math.round(
                                            ((new Date(planActivo.fecha_vencimiento) - new Date()) /
                                                (new Date(planActivo.fecha_vencimiento) - new Date(planActivo.fecha_inicio))) * 100
                                        ))}% restante
                                    </span>
                                </div>
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        background: colorDias,
                                        borderRadius: 4,
                                        width: `${Math.max(0, Math.min(100, Math.round(
                                            ((new Date(planActivo.fecha_vencimiento) - new Date()) /
                                                (new Date(planActivo.fecha_vencimiento) - new Date(planActivo.fecha_inicio))) * 100
                                        )))}%`
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 16, padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ color:'#666', fontSize:'1.1rem', margin:'0 0 0.5rem', display:'inline-flex', alignItems:'center', gap:6 }}>
                          <span style={{width:16,height:16,display:'inline-flex'}}>{Ico.card}</span>
                          No tienes un plan activo
                        </p>
                        <p style={{ color: '#555', margin: 0, fontSize: '0.875rem' }}>Contacta a la administración para contratar un plan.</p>
                    </div>
                )}

                {/* Historial de planes */}
                {historialPlanes && historialPlanes.length > 0 && (
                    <div>
                        <h2 style={{ color: C, fontSize: '1.2rem', fontWeight: 900, margin: '0 0 1.25rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                            Historial de Planes (Últimos 3)
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {historialPlanes.map(cp => {
                                const cfg = estadoConfig[cp.estado] ?? estadoConfig.cancelado;
                                return (
                                    <div key={cp.id} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 10, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.2rem' }}>{cp.plan?.nombre}</p>
                                            <p style={{ color: '#666', margin: 0, fontSize: '0.8rem' }}>
                                                {fmtFecha(cp.fecha_inicio)} → {fmtFecha(cp.fecha_vencimiento)}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ color: C, fontWeight: 700, fontSize: '0.95rem' }}>{fmtPrecio(cp.plan?.precio)}</span>
                                            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </ClienteLayout>
    );
}

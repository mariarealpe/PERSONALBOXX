import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ClienteLayout from '@/Layouts/ClienteLayout';

export default function ClienteReservas({ user, reservas, filters, horas_min_cancelacion = 2 }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const [estado, setEstado] = useState(filters?.estado ?? '');
    const C = '#FF1493';

    const filtrar  = () => router.get('/cliente/reservas', { estado }, { preserveState: true });
    const limpiar  = () => { setEstado(''); router.get('/cliente/reservas'); };
    const cancelar = (id) => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;
        router.patch(`/cliente/reservas/${id}/cancelar`);
    };

    const estadoConfig = {
        confirmada: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Confirmada' },
        en_espera:  { color: '#eab308', bg: 'rgba(234,179,8,0.1)',   label: 'Lista de espera' },
        cancelada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelada'  },
        completada: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Completada' },
    };

    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    // RF-06: Verificar si puede cancelar (debe tener al menos horas_min_cancelacion horas)
    const puedeCancel = (r) => {
        if (!['confirmada', 'en_espera'].includes(r.estado)) return false;
        if (!r.clase?.fecha_hora_inicio) return false;
        const inicio = new Date(r.clase.fecha_hora_inicio);
        const ahora  = new Date();
        if (inicio <= ahora) return false;
        const minutosRestantes = (inicio - ahora) / 60000;
        return minutosRestantes >= horas_min_cancelacion * 60;
    };

    // Cuánto tiempo falta para que no se pueda cancelar
    const tiempoLimiteCancelacion = (r) => {
        if (!r.clase?.fecha_hora_inicio) return null;
        const inicio = new Date(r.clase.fecha_hora_inicio);
        const limite = new Date(inicio.getTime() - horas_min_cancelacion * 3600000);
        const ahora  = new Date();
        if (ahora > limite) return null;
        const minutosHastaLimite = Math.floor((limite - ahora) / 60000);
        if (minutosHastaLimite < 60) return `Cancelación disponible por ${minutosHastaLimite} min más`;
        return null;
    };

    const inp = { background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' };

    return (
        <ClienteLayout user={user}>
            <Head title="Mis Reservas" />
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>📋 Mis Reservas</h1>
                    <p style={{ color: '#999', margin: 0 }}>Gestiona tus reservas activas</p>
                </div>

                {flash.success && (
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#22c55e', fontWeight: 600 }}>
                        {flash.success}
                    </div>
                )}

                {flash.errors?.cancelar && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 600 }}>
                        {flash.errors.cancelar}
                    </div>
                )}

                {/* Filtro */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Estado</label>
                        <select value={estado} onChange={e => setEstado(e.target.value)} style={inp}>
                            <option value="">Todos</option>
                            <option value="confirmada">Confirmadas</option>
                            <option value="en_espera">En lista de espera</option>
                            <option value="cancelada">Canceladas</option>
                            <option value="completada">Completadas</option>
                        </select>
                    </div>
                    <button onClick={filtrar} style={{ background: `linear-gradient(135deg, ${C}, #e60083)`, border: 'none', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>🔍 Filtrar</button>
                    <button onClick={limpiar} style={{ background: 'transparent', border: '2px solid rgba(255,20,147,0.4)', color: C, padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>✕ Limpiar</button>
                </div>

                {/* Nota sobre política de cancelación */}
                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                    <p style={{ color: '#93c5fd', fontSize: '0.82rem', margin: 0 }}>
                        Puedes cancelar hasta <strong>{horas_min_cancelacion} horas antes</strong> del inicio de la clase.
                    </p>
                </div>

                {/* Lista */}
                {reservas.data && reservas.data.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {reservas.data.map(r => {
                                const cfg          = estadoConfig[r.estado] ?? estadoConfig.confirmada;
                                const puedeCancelar = puedeCancel(r);
                                const avisoLimite   = tiempoLimiteCancelacion(r);
                                return (
                                    <div key={r.id} style={{ background: 'rgba(10,10,10,0.95)', border: `2px solid ${r.estado === 'en_espera' ? 'rgba(234,179,8,0.3)' : 'rgba(255,20,147,0.3)'}`, borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: r.clase?.tipo_clase?.color ?? C, flexShrink: 0, marginTop: 4 }} />
                                            <div>
                                                <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.2rem', fontSize: '1rem' }}>
                                                    {r.clase?.tipo_clase?.nombre ?? 'Clase'}
                                                </p>
                                                <p style={{ color: '#999', margin: '0 0 0.15rem', fontSize: '0.85rem' }}>
                                                    {fmtFecha(r.clase?.fecha_hora_inicio)} · {hora(r.clase?.fecha_hora_inicio)} – {hora(r.clase?.fecha_hora_fin)}
                                                </p>
                                                <p style={{ color: '#666', margin: '0 0 0.15rem', fontSize: '0.8rem' }}>
                                                    📍 {r.clase?.sala ?? 'Sin sala'} · 👨‍🏫 {r.clase?.instructor?.name ?? 'Sin instructor'}
                                                </p>
                                                {/* Posición en lista de espera */}
                                                {r.estado === 'en_espera' && r.posicion_espera && (
                                                    <p style={{ color: '#eab308', margin: '0.2rem 0 0', fontSize: '0.78rem', fontWeight: 600 }}>
                                                        ⏳ Posición #{r.posicion_espera} en lista de espera — te avisaremos si se libera un cupo
                                                    </p>
                                                )}
                                                {/* Aviso de límite de cancelación */}
                                                {avisoLimite && (
                                                    <p style={{ color: '#f97316', margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        ⚠️ {avisoLimite}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
                                            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                {r.estado === 'en_espera' ? `⏳ #${r.posicion_espera ?? ''} Espera` : cfg.label}
                                            </span>
                                            {puedeCancelar && (
                                                <button onClick={() => cancelar(r.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {reservas.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {reservas.links.map((link, i) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            style={{ background: link.active ? C : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#fff' : C, padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4 }} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: '#666', margin: '0 0 1rem' }}>No tienes reservas aún.</p>
                        <a href="/cliente/clases" style={{ background: C, color: '#fff', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, textDecoration: 'none' }}>
                            🏋️ Ver Clases Disponibles
                        </a>
                    </div>
                )}
            </div>
        </ClienteLayout>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ClienteLayout from '@/Layouts/ClienteLayout';

export default function ClienteClases({ user, clases, tiposClase, filters }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const [fecha,       setFecha]       = useState(filters?.fecha          ?? '');
    const [tipoClaseId, setTipoClaseId] = useState(filters?.tipo_clase_id  ?? '');
    const [localMsg,    setLocalMsg]    = useState(null);

    const C = '#FF1493';

    const buscar  = () => router.get('/cliente/clases', { fecha, tipo_clase_id: tipoClaseId }, { preserveState: true });
    const limpiar = () => { setFecha(''); setTipoClaseId(''); router.get('/cliente/clases'); };

    const reservar = (claseId) => {
        router.post('/cliente/clases/reservar', { clase_id: claseId }, {
            onSuccess: () => { setLocalMsg({ type: 'success', msg: '¡Reserva confirmada! 🎉' }); setTimeout(() => setLocalMsg(null), 4000); },
            onError:   (e) => { setLocalMsg({ type: 'error',   msg: Object.values(e)[0] });       setTimeout(() => setLocalMsg(null), 4000); },
        });
    };

    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const inp = { background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none' };
    const msgShow = localMsg ?? (flash.success ? { type: 'success', msg: flash.success } : null);

    return (
        <ClienteLayout user={user}>
            <Head title="Clases Disponibles" />
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>🏋️ Clases Disponibles</h1>
                    <p style={{ color: '#999', margin: 0 }}>Reserva tu lugar en las clases que quieras</p>
                </div>

                {msgShow && (
                    <div style={{ background: msgShow.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `2px solid ${msgShow.type === 'success' ? '#22c55e' : '#ef4444'}`, borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: msgShow.type === 'success' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {msgShow.msg}
                    </div>
                )}

                {/* Filtros */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha</label>
                        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Tipo de Clase</label>
                        <select value={tipoClaseId} onChange={e => setTipoClaseId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                            <option value="">Todos</option>
                            {tiposClase.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button onClick={buscar} style={{ background: `linear-gradient(135deg, ${C}, #e60083)`, border: 'none', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>🔍 Buscar</button>
                    <button onClick={limpiar} style={{ background: 'transparent', border: '2px solid rgba(255,20,147,0.4)', color: C, padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>✕ Limpiar</button>
                </div>

                {/* Grilla */}
                {clases.data && clases.data.length > 0 ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {clases.data.map(clase => {
                                const pct       = Math.round((clase.total_reservas / clase.capacidad_maxima) * 100);
                                const colorCupo = clase.cupos_disponibles === 0 ? '#ef4444' : clase.cupos_disponibles <= 3 ? '#eab308' : '#22c55e';
                                return (
                                    <div key={clase.id} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, overflow: 'hidden' }}>
                                        <div style={{ height: 4, background: clase.tipo_clase?.color ?? C }} />
                                        <div style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <h3 style={{ color: '#fff', fontWeight: 900, margin: '0 0 0.2rem', fontSize: '1rem' }}>{clase.tipo_clase?.nombre}</h3>
                                                    <p style={{ color: '#999', margin: 0, fontSize: '0.8rem' }}>{fmtFecha(clase.fecha_hora_inicio)}</p>
                                                </div>
                                                {clase.ya_reservo && (
                                                    <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid #22c55e', borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>✓ Reservado</span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                                                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>🕐 {hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)}</span>
                                                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>📍 {clase.sala ?? 'Sin sala'}</span>
                                                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>👨‍🏫 {clase.instructor?.name ?? 'Sin instructor'}</span>
                                            </div>

                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                    <span style={{ color: '#666', fontSize: '0.7rem' }}>Cupos</span>
                                                    <span style={{ color: colorCupo, fontSize: '0.7rem', fontWeight: 700 }}>{clase.cupos_disponibles} disponibles</span>
                                                </div>
                                                <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: colorCupo, borderRadius: 3 }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                                    <span style={{ color: '#444', fontSize: '0.65rem' }}>{clase.total_reservas} reservados</span>
                                                    <span style={{ color: '#444', fontSize: '0.65rem' }}>{clase.capacidad_maxima} total</span>
                                                </div>
                                            </div>

                                            {clase.ya_reservo ? (
                                                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', borderRadius: 8, padding: '0.65rem', textAlign: 'center', color: '#22c55e', fontWeight: 700, fontSize: '0.875rem' }}>✓ Ya tienes reserva</div>
                                            ) : clase.cupos_disponibles === 0 ? (
                                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '0.65rem', textAlign: 'center', color: '#ef4444', fontWeight: 700, fontSize: '0.875rem' }}>Sin cupos disponibles</div>
                                            ) : (
                                                <button onClick={() => reservar(clase.id)} style={{ width: '100%', background: `linear-gradient(135deg, ${C}, #e60083)`, border: 'none', color: '#fff', borderRadius: 8, padding: '0.65rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                                                    Reservar Lugar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {clases.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {clases.links.map((link, i) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            style={{ background: link.active ? C : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#fff' : C, padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4 }} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: '#666' }}>No hay clases disponibles con los filtros seleccionados.</p>
                    </div>
                )}
            </div>
        </ClienteLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ClienteLayout from '@/Layouts/ClienteLayout';

export default function ClienteHistorial({ user, historial, tiposClase, totalPorTipo, totalClases, filters }) {
    const [fechaInicio,  setFechaInicio]  = useState(filters?.fecha_inicio   ?? '');
    const [fechaFin,     setFechaFin]     = useState(filters?.fecha_fin      ?? '');
    const [tipoClaseId,  setTipoClaseId]  = useState(filters?.tipo_clase_id  ?? '');
    const C = '#FF1493';

    const filtrar  = () => router.get('/cliente/historial', { fecha_inicio: fechaInicio, fecha_fin: fechaFin, tipo_clase_id: tipoClaseId }, { preserveState: true });
    const limpiar  = () => { setFechaInicio(''); setFechaFin(''); setTipoClaseId(''); router.get('/cliente/historial'); };

    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const inp = { background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none' };

    const Ico = {
      chart:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      search:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
      x:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
      user:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>,
      check:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>,
    };

    return (
        <ClienteLayout user={user}>
            <Head title="Mi Historial" />
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}><span style={{width:22,height:22,display:'inline-flex',marginRight:8}}>{Ico.chart}</span>Mi Historial</h1>
                    <p style={{ color: '#999', margin: 0 }}>Todas las clases que has tomado</p>
                </div>

                {/* Stat total + por tipo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem 2rem', textAlign: 'center', minWidth: 160 }}>
                        <p style={{ color: '#999', fontSize: '0.75rem', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Total Clases</p>
                        <h2 style={{ color: C, fontSize: '3rem', fontWeight: 900, margin: 0 }}>{totalClases}</h2>
                    </div>

                    {totalPorTipo && totalPorTipo.length > 0 && (
                        <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem' }}>
                            <p style={{ color: '#999', fontSize: '0.75rem', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Por Tipo de Clase</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {totalPorTipo.map(t => (
                                    <div key={t.nombre} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                                        <span style={{ color: '#ccc', fontSize: '0.875rem', flex: 1 }}>{t.nombre}</span>
                                        <div style={{ flex: 2, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.round((t.total / totalClases) * 100)}%`, background: t.color, borderRadius: 3 }} />
                                        </div>
                                        <span style={{ color: C, fontWeight: 700, fontSize: '0.875rem', minWidth: 30, textAlign: 'right' }}>{t.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filtros */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Desde</label>
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={inp} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Hasta</label>
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={inp} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Tipo</label>
                        <select value={tipoClaseId} onChange={e => setTipoClaseId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                            <option value="">Todos</option>
                            {tiposClase.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button onClick={filtrar} style={{ background: `linear-gradient(135deg, ${C}, #e60083)`, border: 'none', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}><span style={{width:14,height:14,display:'inline-flex',marginRight:6}}>{Ico.search}</span>Filtrar</button>
                    <button onClick={limpiar} style={{ background: 'transparent', border: '2px solid rgba(255,20,147,0.4)', color: C, padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}><span style={{width:14,height:14,display:'inline-flex',marginRight:6}}>{Ico.x}</span>Limpiar</button>
                </div>

                {/* Lista */}
                {historial.data && historial.data.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                            {historial.data.map(a => (
                                <div key={a.id} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.clase?.tipo_clase?.color ?? C, flexShrink: 0 }} />
                                        <div>
                                            <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.95rem' }}>
                                                {a.clase?.tipo_clase?.nombre}
                                            </p>
                                            <p style={{ color: '#999', margin: 0, fontSize: '0.8rem' }}>
                                                {fmtFecha(a.clase?.fecha_hora_inicio)} · {hora(a.clase?.fecha_hora_inicio)} – {hora(a.clase?.fecha_hora_fin)}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ color:'#666', fontSize:'0.8rem', display:'inline-flex', alignItems:'center', gap:4 }}>
                                          <span style={{width:13,height:13,display:'inline-flex'}}>{Ico.user}</span> {a.clase?.instructor?.name ?? 'Sin instructor'}
                                        </span>
                                        <span style={{ /* ... */ display:'inline-flex', alignItems:'center', gap:4 }}>
                                          <span style={{width:13,height:13,display:'inline-flex'}}>{Ico.check}</span> Asistí
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {historial.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {historial.links.map((link, i) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            style={{ background: link.active ? C : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#fff' : C, padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4 }} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: '#666' }}>No tienes clases registradas aún.</p>
                    </div>
                )}
            </div>
        </ClienteLayout>
    );
}

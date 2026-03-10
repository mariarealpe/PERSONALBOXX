import { Head } from '@inertiajs/react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import InstructorLayout from '@/Layouts/InstructorLayout';

export default function InstructorClases({ user, clases, filters }) {
    const [fecha,  setFecha]  = useState(filters?.fecha  ?? '');
    const [estado, setEstado] = useState(filters?.estado ?? '');

    const estadoConfig = {
        programada: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Programada' },
        en_curso:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'En Curso'   },
        finalizada: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Finalizada' },
        cancelada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelada'  },
    };

    const buscar  = () => router.get('/instructor/clases', { fecha, estado }, { preserveState: true });
    const limpiar = () => { setFecha(''); setEstado(''); router.get('/instructor/clases', {}); };
    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const inp = { background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none' };

    return (
        <InstructorLayout user={user}>
            <Head title="Mis Clases" />
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: '0 0 0.5rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>📅 Mis Clases</h1>
                    <p style={{ color: '#999', margin: 0 }}>Consulta todas tus clases asignadas</p>
                </div>
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#FF1493', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha</label>
                        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#FF1493', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Estado</label>
                        <select value={estado} onChange={e => setEstado(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                            <option value="">Todos</option>
                            <option value="programada">Programada</option>
                            <option value="en_curso">En Curso</option>
                            <option value="finalizada">Finalizada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <button onClick={buscar} style={{ background: 'linear-gradient(135deg,#FF1493,#e60083)', border: 'none', color: '#000', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>🔍 Filtrar</button>
                    <button onClick={limpiar} style={{ background: 'transparent', border: '2px solid rgba(255,20,147,0.4)', color: '#FF1493', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>✕ Limpiar</button>
                </div>
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 30px rgba(255,20,147,0.1)' }}>
                    {clases.data && clases.data.length > 0 ? (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(255,20,147,0.3)' }}>
                                        {['Fecha','Tipo de Clase','Horario','Sala','Reservas','Asistencias','Estado','Acciones'].map(h => (
                                            <th key={h} style={{ padding: '1rem 1.25rem', color: '#FF1493', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clases.data.map((clase, i) => {
                                        const cfg = estadoConfig[clase.estado] ?? estadoConfig.programada;
                                        return (
                                            <tr key={clase.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,20,147,0.02)' }}>
                                                <td style={{ padding: '1rem 1.25rem', color: '#fff', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtFecha(clase.fecha_hora_inicio)}</td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: clase.tipo_clase?.color ?? '#FF1493', flexShrink: 0 }} />
                                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{clase.tipo_clase?.nombre}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)}</td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#ccc', fontSize: '0.875rem' }}>{clase.sala ?? '—'}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                                    <span style={{ color: (clase.total_reservas ?? 0) >= clase.capacidad_maxima ? '#ef4444' : '#22c55e', fontWeight: 700, fontSize: '0.875rem' }}>{clase.total_reservas ?? 0}</span>
                                                    <span style={{ color: '#666', fontSize: '0.875rem' }}> / {clase.capacidad_maxima}</span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#FF1493', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center' }}>{clase.asistencias_count ?? 0}</td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    {(clase.estado === 'programada' || clase.estado === 'en_curso') && (
                                                        <Link href={`/instructor/asistencias?clase_id=${clase.id}`} style={{ background: 'rgba(255,20,147,0.15)', border: '1px solid #FF1493', color: '#FF1493', borderRadius: 6, padding: '0.375rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>✅ Asistencia</Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                            {clases.last_page > 1 && (
                                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,20,147,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Mostrando {clases.from}–{clases.to} de {clases.total} clases</span>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {clases.links.map((link, i) => (
                                            <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)} dangerouslySetInnerHTML={{ __html: link.label }}
                                                    style={{ background: link.active ? '#FF1493' : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#000' : '#FF1493', padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4 }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>No se encontraron clases con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </div>
        </InstructorLayout>
    );
}

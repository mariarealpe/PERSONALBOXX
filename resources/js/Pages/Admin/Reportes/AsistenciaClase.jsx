import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function AsistenciaClase({ auth, clases, instructores, tiposClase, filters }) {
    const { data, setData, get, processing } = useForm({
        fecha_inicio: filters?.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: filters?.fecha_fin || new Date().toISOString().split('T')[0],
        instructor_id: filters?.instructor_id || '',
        tipo_clase_id: filters?.tipo_clase_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('admin.reportes.asistencia-clase'));
    };

    const fmt = (n) => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';
    const tasa = (asist, cap) => cap > 0 ? Math.round((asist / cap) * 100) : 0;

    const totales = clases.reduce((acc, c) => ({
        reservas: acc.reservas + (c.reservas_confirmadas_count || 0),
        asistentes: acc.asistentes + (c.asistencias_count || 0),
    }), { reservas: 0, asistentes: 0 });

    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };
    const boxStyle = { background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 0 20px rgba(255,20,147,0.1)' };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Reporte de Asistencia por Clase" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>REPORTE DE ASISTENCIA</h1>
                    <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Detalle de asistencia por clase en un período</p>
                </div>

                {/* Filtros */}
                <form onSubmit={handleSubmit} style={{ ...boxStyle, marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div><label style={labelStyle}>Fecha Inicio *</label><input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Fecha Fin *</label><input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required style={inputStyle} /></div>
                    <div>
                        <label style={labelStyle}>Instructor</label>
                        <select value={data.instructor_id} onChange={e => setData('instructor_id', e.target.value)} style={{ ...inputStyle, color: data.instructor_id ? '#fff' : '#666' }}>
                            <option value="">Todos</option>
                            {instructores.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Tipo de Clase</label>
                        <select value={data.tipo_clase_id} onChange={e => setData('tipo_clase_id', e.target.value)} style={{ ...inputStyle, color: data.tipo_clase_id ? '#fff' : '#666' }}>
                            <option value="">Todos</option>
                            {tiposClase.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={processing} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>
                        🔍 {processing ? 'Buscando...' : 'Generar Reporte'}
                    </button>
                </form>

                {/* Resumen */}
                {clases.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { label: 'Total Clases', value: clases.length, icon: '📅' },
                            { label: 'Total Reservas', value: fmt(totales.reservas), icon: '📋' },
                            { label: 'Total Asistentes', value: fmt(totales.asistentes), icon: '✅' },
                        ].map(s => (
                            <div key={s.label} style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                                <div>
                                    <div style={{ color: '#FF1493', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabla */}
                <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,20,147,0.1)' }}>
                        <tr>
                            {['Clase', 'Instructor', 'Fecha', 'Capacidad', 'Reservas', 'Asistentes', 'Tasa'].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#FF1493', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(255,20,147,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {clases.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay datos para el período seleccionado</td></tr>
                        ) : clases.map(c => {
                            const t = tasa(c.asistencias_count, c.capacidad_maxima);
                            const color = t >= 80 ? '#22c55e' : t >= 50 ? '#ffc107' : '#ef4444';
                            return (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || '#FF1493', flexShrink: 0 }} />
                                            <span style={{ color: '#fff', fontWeight: 700 }}>{c.tipo_clase?.nombre}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc' }}>{c.instructor?.name}</td>
                                    <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem' }}>{formatDate(c.fecha_hora_inicio)}</td>
                                    <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.capacidad_maxima}</td>
                                    <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.reservas_confirmadas_count ?? 0}</td>
                                    <td style={{ padding: '1rem', color: '#FF1493', fontWeight: 700, textAlign: 'center' }}>{c.asistencias_count ?? 0}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ color, fontWeight: 700, background: `${color}22`, border: `1px solid ${color}`, padding: '0.25rem 0.6rem', borderRadius: 4, fontSize: '0.8rem' }}>{t}%</span>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

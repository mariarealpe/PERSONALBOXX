import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function LiquidacionHistorial({ auth, liquidaciones, instructores, totalPagado, filters }) {
    const fmt = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const green = '#22c55e';

    const { data, setData, get, processing } = useForm({
        instructor_id: filters?.instructor_id || '',
        fecha_inicio:  filters?.fecha_inicio  || '',
        fecha_fin:     filters?.fecha_fin     || '',
    });

    const [eliminando, setEliminando] = useState(null);

    const handleFiltrar = (e) => {
        e.preventDefault();
        get(route('admin.reportes.liquidacion.historial'));
    };

    const handleEliminar = (id) => {
        if (!confirm('¿Eliminar este registro de liquidación?')) return;
        router.delete(route('admin.reportes.liquidacion.historial.destroy', id));
    };

    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: `2px solid ${green}44`, borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: green, fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };
    const boxStyle   = { background: 'rgba(10,10,10,0.95)', border: `2px solid ${green}44`, borderRadius: 12, padding: '1.5rem', boxShadow: `0 0 20px ${green}10` };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Historial de Liquidaciones" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: green, margin: 0, textShadow: `0 0 10px ${green}80` }}>HISTORIAL DE LIQUIDACIONES</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Registro de pagos procesados a instructores</p>
                    </div>
                    <div style={{ ...boxStyle, padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <div style={{ color: '#999', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>Total Pagado</div>
                        <div style={{ color: green, fontSize: '1.75rem', fontWeight: 900 }}>{fmt(totalPagado)}</div>
                        <div style={{ color: '#555', fontSize: '0.7rem' }}>{liquidaciones.length} liquidaciones</div>
                    </div>
                </div>

                {/* Filtros */}
                <form onSubmit={handleFiltrar} style={{ ...boxStyle, marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div>
                        <label style={labelStyle}>Instructor</label>
                        <select value={data.instructor_id} onChange={e => setData('instructor_id', e.target.value)} style={{ ...inputStyle, color: data.instructor_id ? '#fff' : '#666' }}>
                            <option value="">Todos</option>
                            {instructores.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div><label style={labelStyle}>Desde</label><input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Hasta</label><input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} style={inputStyle} /></div>
                    <button type="submit" disabled={processing} style={{ background: `linear-gradient(135deg,${green},#16a34a)`, color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer' }}>
                        🔍 Filtrar
                    </button>
                </form>

                {/* Tabla */}
                <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: `${green}18` }}>
                        <tr>
                            {['Instructor', 'Período', 'Clases', 'Asistentes', 'Tarifa', 'Total Pagado', 'Fecha Pago', 'Aprobado por', ''].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: green, fontWeight: 900, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `2px solid ${green}33` }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {liquidaciones.length === 0 ? (
                            <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>No hay liquidaciones registradas</td></tr>
                        ) : liquidaciones.map((l, i) => (
                            <tr key={l.id} style={{ borderBottom: `1px solid ${green}18` }}>
                                <td style={{ padding: '0.875rem 1rem', color: '#fff', fontWeight: 700 }}>{l.instructor}</td>
                                <td style={{ padding: '0.875rem 1rem', color: '#ccc', fontSize: '0.8rem' }}>{l.fecha_inicio} – {l.fecha_fin}</td>
                                <td style={{ padding: '0.875rem 1rem', color: '#ccc', textAlign: 'center' }}>{l.total_clases}</td>
                                <td style={{ padding: '0.875rem 1rem', color: '#ccc', textAlign: 'center' }}>{l.total_asistentes}</td>
                                <td style={{ padding: '0.875rem 1rem', color: '#999', fontSize: '0.8rem' }}>
                                    {l.tipo_tarifa === 'por_asistente' ? `${fmt(l.tarifa_aplicada)}/asist.` : `${fmt(l.tarifa_aplicada)}/clase`}
                                </td>
                                <td style={{ padding: '0.875rem 1rem', color: green, fontWeight: 900, fontSize: '1rem' }}>{fmt(l.total_pago)}</td>
                                <td style={{ padding: '0.875rem 1rem', color: '#ccc', fontSize: '0.8rem' }}>{l.fecha_pago}</td>
                                <td style={{ padding: '0.875rem 1rem', color: '#999', fontSize: '0.8rem' }}>{l.aprobado_por}</td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <button onClick={() => handleEliminar(l.id)}
                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                        🗑
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        {liquidaciones.length > 0 && (
                            <tfoot>
                            <tr style={{ background: `${green}18` }}>
                                <td colSpan={5} style={{ padding: '1rem', color: green, fontWeight: 900, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.85rem' }}>TOTAL</td>
                                <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.25rem' }}>{fmt(totalPagado)}</td>
                                <td colSpan={3} />
                            </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

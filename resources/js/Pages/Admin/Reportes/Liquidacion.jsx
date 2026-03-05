import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function Liquidacion({ auth, instructor, clases, totalPago, tarifas, instructores, filters }) {
    const { data, setData, get, processing } = useForm({
        instructor_id: filters?.instructor_id || '',
        fecha_inicio: filters?.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: filters?.fecha_fin || new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('admin.reportes.liquidacion'));
    };

    const fmt = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';

    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: '2px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: '#22c55e', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };
    const boxStyle = { background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 0 20px rgba(34,197,94,0.1)' };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Liquidación de Instructores" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e', margin: 0, textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>LIQUIDACIÓN</h1>
                    <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Cálculo de pagos a instructores</p>
                </div>

                {/* Filtros */}
                <form onSubmit={handleSubmit} style={{ ...boxStyle, marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div>
                        <label style={labelStyle}>Instructor *</label>
                        <select value={data.instructor_id} onChange={e => setData('instructor_id', e.target.value)} required style={{ ...inputStyle, color: data.instructor_id ? '#fff' : '#666' }}>
                            <option value="">-- Seleccionar --</option>
                            {instructores.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div><label style={labelStyle}>Fecha Inicio *</label><input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Fecha Fin *</label><input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required style={inputStyle} /></div>
                    <button type="submit" disabled={processing} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>
                        💰 {processing ? 'Calculando...' : 'Calcular'}
                    </button>
                </form>

                {instructor && (
                    <>
                        {/* Info instructor + total */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
                            <div style={boxStyle}>
                                <h2 style={{ color: '#22c55e', fontWeight: 900, margin: '0 0 1rem', fontSize: '1.5rem' }}>{instructor.name}</h2>
                                <p style={{ color: '#999', margin: '0 0 0.5rem', fontSize: '0.875rem' }}>📧 {instructor.email}</p>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                    <div><span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tarifa por Clase</span><div style={{ color: '#22c55e', fontWeight: 900, fontSize: '1.25rem' }}>{fmt(tarifas.por_clase)}</div></div>
                                    <div><span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tarifa por Asistente</span><div style={{ color: '#22c55e', fontWeight: 900, fontSize: '1.25rem' }}>{fmt(tarifas.por_asistente)}</div></div>
                                    <div><span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Clases Finalizadas</span><div style={{ color: '#22c55e', fontWeight: 900, fontSize: '1.25rem' }}>{clases.length}</div></div>
                                </div>
                            </div>
                            <div style={{ ...boxStyle, textAlign: 'center', minWidth: 200 }}>
                                <div style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Total a Pagar</div>
                                <div style={{ color: '#22c55e', fontSize: '3rem', fontWeight: 900, textShadow: '0 0 20px rgba(34,197,94,0.5)' }}>{fmt(totalPago)}</div>
                                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem' }}>COP</div>
                            </div>
                        </div>

                        {/* Tabla de clases */}
                        <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(34,197,94,0.1)' }}>
                                <tr>
                                    {['Fecha', 'Tipo de Clase', 'Asistentes', 'Tarifa Aplicada', 'Pago'].map(h => (
                                        <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#22c55e', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(34,197,94,0.3)' }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {clases.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay clases finalizadas en el período seleccionado</td></tr>
                                ) : clases.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
                                        <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem' }}>{formatDate(c.fecha_hora_inicio)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || '#22c55e', flexShrink: 0 }} />
                                                <span style={{ color: '#fff', fontWeight: 700 }}>{c.tipo_clase?.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.asistencias_count}</td>
                                        <td style={{ padding: '1rem', color: '#999', fontSize: '0.875rem' }}>
                                            {tarifas.por_asistente > 0 ? `${c.asistencias_count} × ${fmt(tarifas.por_asistente)}` : 'Tarifa fija por clase'}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#22c55e', fontWeight: 900, fontSize: '1.125rem' }}>{fmt(c.pago)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                {clases.length > 0 && (
                                    <tfoot>
                                    <tr style={{ background: 'rgba(34,197,94,0.1)' }}>
                                        <td colSpan={4} style={{ padding: '1rem', color: '#22c55e', fontWeight: 900, textAlign: 'right', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</td>
                                        <td style={{ padding: '1rem', color: '#22c55e', fontWeight: 900, fontSize: '1.5rem' }}>{fmt(totalPago)}</td>
                                    </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

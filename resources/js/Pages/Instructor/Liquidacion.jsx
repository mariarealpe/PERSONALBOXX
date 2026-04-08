import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstructorLayout from '@/Layouts/InstructorLayout';

const Ico = {
    money: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H7"/>
        </svg>
    ),
    briefcase: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/>
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
};

export default function InstructorLiquidacion({ user, instructor, clases, totales, filters, periodoLabel, pagoRegistrado }) {
    const [fechaInicio, setFechaInicio] = useState(filters?.fecha_inicio ?? '');
    const [fechaFin, setFechaFin] = useState(filters?.fecha_fin ?? '');

    const toNum = (v) => {
        if (v === null || v === undefined || v === '') return 0;
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        const clean = String(v).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        const n = Number(clean);
        return Number.isFinite(n) ? n : 0;
    };

    const tarifaPorClase = toNum(
        instructor?.tarifa_por_clase
        ?? instructor?.instructor?.tarifa_por_clase
        ?? user?.instructor?.tarifa_por_clase
        ?? 0
    );

    const tarifaPorAsistente = toNum(
        instructor?.tarifa_por_asistente
        ?? instructor?.instructor?.tarifa_por_asistente
        ?? user?.instructor?.tarifa_por_asistente
        ?? 0
    );

    const tipoTarifa =
        tarifaPorClase > 0 && tarifaPorAsistente > 0
            ? 'mixta'
            : tarifaPorAsistente > 0
                ? 'por_asistente'
                : 'por_clase';

    const asistentesClase = (c) =>
        Number(c?.total_asistentes ?? c?.asistencias_count ?? c?.reservas_confirmadas_count ?? 0);

    const tarifasClase = (c) => ({
        porClase: toNum(c?.tarifa_por_clase_aplicada ?? tarifaPorClase),
        porAsistente: toNum(c?.tarifa_por_asistente_aplicada ?? tarifaPorAsistente),
    });

    const tipoTarifaClase = (c) => {
        if (c?.tipo_tarifa_aplicada) return c.tipo_tarifa_aplicada; // prioridad backend
        const t = tarifasClase(c);
        if (t.porClase > 0 && t.porAsistente > 0) return 'mixta';
        if (t.porAsistente > 0) return 'por_asistente';
        return 'por_clase';
    };

    const calcularPagoClase = (c) => {
        if (c?.pago !== undefined && c?.pago !== null) return toNum(c.pago); // prioridad backend
        const t = tarifasClase(c);
        return (t.porClase > 0 ? t.porClase : 0) + (t.porAsistente > 0 ? asistentesClase(c) * t.porAsistente : 0);
    };

    const clasesFinalizadas = (clases ?? []).filter((c) => c?.estado === 'finalizada');

    const clasesConPago = clasesFinalizadas.map((c) => ({
        ...c,
        _asistentesCalc: asistentesClase(c),
        _tarifas: tarifasClase(c),
        _tipoTarifa: tipoTarifaClase(c),
        _pagoCalculado: calcularPagoClase(c),
    }));

    const totalPagoVista = clasesConPago.reduce((acc, c) => acc + c._pagoCalculado, 0);
    const totalClasesVista = clasesConPago.length;
    const totalAsistentesVista = clasesConPago.reduce((acc, c) => acc + c._asistentesCalc, 0);

    const hasData = clasesConPago.length > 0;
    const yaPagado = !!pagoRegistrado;

    const calcular = () => {
        if (!fechaInicio || !fechaFin) return;
        router.get(
            '/instructor/liquidacion',
            { fecha_inicio: fechaInicio, fecha_fin: fechaFin, _recalc: Date.now() },
            { preserveState: false, replace: true }
        );
    };

    const limpiar = () => {
        setFechaInicio(''); setFechaFin('');
        router.get('/instructor/liquidacion', {}, { preserveState: false, replace: true });
    };

    const fmtCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);
    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <InstructorLayout user={user}>
            <Head title="Mi Liquidación" />

            <div className="liq-wrap">
                <div className="liq-head">
                    <h1 className="liq-title"><span className="liq-ico-lg">{Ico.money}</span>Mi Liquidación</h1>
                    <p className="liq-sub">Consulta tu pago estimado por período</p>
                </div>

                <div className="liq-card liq-tarifa">
                    <span className="liq-ico-xl">{Ico.briefcase}</span>
                    <div>
                        <p className="liq-name">{user.name}</p>
                        <p className="liq-muted">
                            {tipoTarifa === 'mixta'
                                ? `Tarifa mixta: ${fmtCOP(tarifaPorClase)} base + ${fmtCOP(tarifaPorAsistente)} por persona`
                                : tipoTarifa === 'por_asistente'
                                    ? `Tarifa por asistente: ${fmtCOP(tarifaPorAsistente)} por persona`
                                    : `Tarifa fija por clase: ${fmtCOP(tarifaPorClase)}`}
                        </p>
                    </div>
                    <div className={`liq-pill ${tipoTarifa === 'mixta' ? 'is-mix' : tipoTarifa === 'por_asistente' ? 'is-purple' : 'is-pink'}`}>
                        {tipoTarifa === 'mixta' ? 'Tarifa Mixta' : tipoTarifa === 'por_asistente' ? 'Por Asistente' : 'Tarifa Fija'}
                    </div>
                </div>

                <div className="liq-card liq-filtros">
                    <div className="liq-field">
                        <label>Desde</label>
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="liq-input" />
                    </div>
                    <div className="liq-field">
                        <label>Hasta</label>
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="liq-input" />
                    </div>
                    <button onClick={calcular} disabled={!fechaInicio || !fechaFin} className="liq-btn liq-btn-primary">
                        <span className="liq-ico-sm">{Ico.chart}</span>Calcular
                    </button>
                    {hasData && (
                        <button onClick={limpiar} className="liq-btn liq-btn-outline">
                            <span className="liq-ico-sm">{Ico.x}</span>Limpiar
                        </button>
                    )}
                </div>

                {pagoRegistrado && (
                    <div className="liq-card liq-paid">
                        <span className="liq-ico-xl ok">{Ico.check}</span>
                        <div style={{ flex: 1 }}>
                            <p className="liq-paid-title">Tu pago ya fue registrado para este período</p>
                            <p className="liq-muted">
                                Período: <strong>{pagoRegistrado.fecha_inicio} — {pagoRegistrado.fecha_fin}</strong> ·
                                Fecha de pago: <strong>{pagoRegistrado.fecha_pago}</strong>
                                {pagoRegistrado.notas && <> · Nota: <em>{pagoRegistrado.notas}</em></>}
                            </p>
                        </div>
                        <div className="liq-paid-total">
                            <p>Total Pagado</p>
                            <b>{fmtCOP(pagoRegistrado.total_pago)}</b>
                        </div>
                    </div>
                )}

                {hasData ? (
                    <>
                        <div className="liq-stats">
                            {[
                                { label: 'Clases Dictadas', value: totalClasesVista, icon: Ico.calendar, color: '#3b82f6' },
                                { label: 'Total Asistentes', value: totalAsistentesVista, icon: Ico.users, color: '#22c55e' },
                                { label: 'Total a Pagar', value: fmtCOP(totalPagoVista), icon: Ico.money, color: '#FF1493', big: true },
                            ].map((s) => (
                                <div key={s.label} className="liq-card liq-stat" style={{ '--c': s.color }}>
                                    <span className="liq-stat-ico">{s.icon}</span>
                                    <div>
                                        <p>{s.label}</p>
                                        <h3 className={s.big ? 'big' : ''}>{s.value}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`liq-card liq-table-wrap ${yaPagado ? 'is-paid' : ''}`}>
                            <div className="liq-table-head">
                                <h3>Detalle por Clase (solo finalizadas) · {periodoLabel}</h3>
                                {yaPagado && <span className="liq-pill is-green">Período ya pagado</span>}
                            </div>

                            <div className="liq-table-scroll">
                                <table className="liq-table">
                                    <thead>
                                    <tr>
                                        <th>Fecha</th><th>Tipo de Clase</th><th>Horario</th><th>Sala</th>
                                        <th>Asistentes</th><th>Tarifa aplicada</th><th>Subtotal</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clasesConPago.map((clase, i) => (
                                        <tr key={clase.id} className={i % 2 ? 'odd' : ''}>
                                            <td>{fmtFecha(clase.fecha_hora_inicio)}</td>
                                            <td>
                                                <div className="liq-tipo">
                                                    <span className="dot" style={{ background: clase.tipo_clase?.color ?? '#FF1493' }} />
                                                    <span>{clase.tipo_clase?.nombre}</span>
                                                </div>
                                            </td>
                                            <td>{hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)}</td>
                                            <td>{clase.sala ?? '—'}</td>
                                            <td className="center ok">{clase._asistentesCalc}</td>
                                            <td>
                                                {clase._tipoTarifa === 'mixta'
                                                    ? `${fmtCOP(clase._tarifas.porClase)} + (${fmtCOP(clase._tarifas.porAsistente)} × ${clase._asistentesCalc})`
                                                    : clase._tipoTarifa === 'por_asistente'
                                                        ? `${fmtCOP(clase._tarifas.porAsistente)} × ${clase._asistentesCalc}`
                                                        : `Fija: ${fmtCOP(clase._tarifas.porClase)}`}
                                            </td>
                                            <td className="pink strong">{fmtCOP(clase._pagoCalculado)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan="6" className="total-label">TOTAL A PAGAR</td>
                                        <td className="total-val">{fmtCOP(totalPagoVista)}</td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="liq-card liq-empty">
                        <p>No hay clases finalizadas en el período seleccionado.</p>
                        <small>Solo se incluyen clases con estado <strong>finalizada</strong>.</small>
                    </div>
                )}
            </div>

            <style>{`
                .liq-wrap{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:1rem}
                .liq-head{margin-bottom:.35rem}.liq-title{display:flex;align-items:center;gap:.55rem;color:#FF1493;margin:0;font-size:clamp(1.55rem,4vw,2rem);font-weight:900;text-shadow:0 0 12px rgba(255,20,147,.45)}
                .liq-sub{color:#777;margin:.2rem 0 0}.liq-ico-lg{width:24px;height:24px;display:inline-flex}.liq-ico-xl{width:30px;height:30px;display:inline-flex;color:#FF1493}.liq-ico-xl.ok{color:#22c55e}.liq-ico-sm{width:14px;height:14px;display:inline-flex}
                .liq-card{background:rgba(255,255,255,.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.07);border-top:1px solid rgba(255,255,255,.14);border-radius:14px;box-shadow:0 0 24px rgba(255,20,147,.08),0 8px 30px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)}
                .liq-muted{color:#9a9a9a;font-size:.85rem;margin:0}.liq-name{color:#FF1493;font-weight:800;margin:0 0 .2rem}

                .liq-tarifa{padding:1.1rem 1.2rem;display:flex;align-items:center;gap:.9rem;flex-wrap:wrap}
                .liq-pill{margin-left:auto;border:1px solid;border-radius:999px;padding:.28rem .8rem;font-size:.75rem;font-weight:700}
                .liq-pill.is-purple{color:#9333ea;border-color:#9333ea;background:rgba(147,51,234,.12)}
                .liq-pill.is-pink{color:#FF1493;border-color:#FF1493;background:rgba(255,20,147,.12)}
                .liq-pill.is-green{color:#22c55e;border-color:#22c55e;background:rgba(34,197,94,.12)}
                .liq-pill.is-mix{color:#06b6d4;border-color:#06b6d4;background:rgba(6,182,212,.12)}

                .liq-filtros{padding:1rem;display:flex;gap:.8rem;align-items:flex-end;flex-wrap:wrap}
                .liq-field{display:flex;flex-direction:column;gap:.45rem}
                .liq-field label{color:#FF1493;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1px}
                .liq-input{background:rgba(0,0,0,.45);border:1px solid rgba(255,20,147,.35);color:#fff;border-radius:10px;padding:.58rem .8rem;outline:none;min-width:180px}
                .liq-btn{border-radius:9px;padding:.58rem 1rem;font-size:.83rem;font-weight:800;display:inline-flex;align-items:center;gap:.35rem;cursor:pointer}
                .liq-btn-primary{background:#FF1493;border:1px solid #FF1493;color:#000}.liq-btn-primary:disabled{opacity:.45;cursor:not-allowed}
                .liq-btn-outline{background:transparent;border:1px solid rgba(255,20,147,.45);color:#FF1493}

                .liq-paid{padding:1rem 1.2rem;display:flex;align-items:center;gap:.9rem;flex-wrap:wrap;border-color:rgba(34,197,94,.5);box-shadow:0 0 20px rgba(34,197,94,.12)}
                .liq-paid-title{color:#22c55e;font-weight:900;margin:0 0 .2rem;text-transform:uppercase;letter-spacing:.8px;font-size:.9rem}
                .liq-paid-total{border:1px solid #22c55e;border-radius:10px;padding:.45rem .9rem;text-align:center;background:rgba(34,197,94,.12)}
                .liq-paid-total p{margin:0;color:#94a3b8;font-size:.66rem;text-transform:uppercase}.liq-paid-total b{color:#22c55e;font-size:1.2rem}

                .liq-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.9rem}
                .liq-stat{padding:1rem;display:flex;align-items:center;gap:.75rem;border-color:color-mix(in oklab, var(--c) 35%, transparent)}
                .liq-stat-ico{width:30px;height:30px;display:inline-flex;color:var(--c)}
                .liq-stat p{margin:0 0 .2rem;color:#8a8a8a;font-size:.72rem;text-transform:uppercase;letter-spacing:.9px}
                .liq-stat h3{margin:0;color:var(--c);font-size:1.45rem;font-weight:900}.liq-stat h3.big{font-size:1.6rem}

                .liq-table-wrap{overflow:hidden}.liq-table-wrap.is-paid{border-color:rgba(34,197,94,.4)}
                .liq-table-head{padding:.95rem 1.1rem;border-bottom:1px solid rgba(255,20,147,.2);display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap}
                .liq-table-head h3{margin:0;color:#FF1493;font-size:.82rem;font-weight:900;text-transform:uppercase;letter-spacing:1px}
                .liq-table-scroll{overflow:auto}
                .liq-table{width:100%;border-collapse:collapse;min-width:900px}
                .liq-table th,.liq-table td{padding:.9rem .95rem;border-bottom:1px solid rgba(255,20,147,.08);font-size:.82rem;color:#d4d4d4;white-space:nowrap}
                .liq-table th{color:#FF1493;text-transform:uppercase;letter-spacing:.8px;font-size:.72rem;text-align:left}
                .liq-table tr.odd{background:rgba(255,20,147,.02)}
                .liq-tipo{display:flex;align-items:center;gap:.45rem}.liq-tipo .dot{width:9px;height:9px;border-radius:50%}
                .liq-table .center{text-align:center}.liq-table .ok{color:#22c55e;font-weight:800}.liq-table .pink{color:#FF1493}.liq-table .strong{font-weight:900}
                .liq-table tfoot td{border-top:1px solid rgba(255,20,147,.24);border-bottom:0;background:rgba(255,20,147,.05)}
                .liq-table .total-label{text-align:right;color:#FF1493;font-weight:900;font-size:.8rem}
                .liq-table .total-val{color:#FF1493;font-size:1.2rem;font-weight:900}

                .liq-empty{padding:2.4rem 1rem;text-align:center}
                .liq-empty p{margin:0 0 .3rem;color:#7a7a7a}.liq-empty small{color:#595959}.liq-empty strong{color:#9ca3af}

                @media (max-width:900px){.liq-stats{grid-template-columns:1fr 1fr}}
                @media (max-width:620px){
                    .liq-input{min-width:100%}
                    .liq-filtros{padding:.9rem}
                    .liq-field{width:100%}
                    .liq-btn{width:100%;justify-content:center}
                    .liq-stats{grid-template-columns:1fr}
                }
            `}</style>
        </InstructorLayout>
    );
}

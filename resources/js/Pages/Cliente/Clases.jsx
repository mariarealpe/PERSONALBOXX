import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ClienteLayout from '@/Layouts/ClienteLayout';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIAS_CORTO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toYMD(d) {
    const p = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function parseYMD(s) {
    if (!s) return new Date();
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, m-1, d);
}
function startOfWeekMon(d) {
    const day = d.getDay(), diff = day===0 ? -6 : 1-day;
    const r = new Date(d); r.setDate(d.getDate()+diff); r.setHours(0,0,0,0); return r;
}
function addDays(d,n) { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function isSameDay(a,b) {
    return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
}
const toDatetimeLocal = v => {
    if (!v) return '';
    if (v.includes('T')&&!v.includes('Z')&&!v.includes('.')) return v.slice(0,16);
    if (v.includes('Z')||v.includes('.')) {
        const d=new Date(v),p=n=>String(n).padStart(2,'0');
        return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    }
    return v.replace(' ','T').slice(0,16);
};
const fmtHora = d => d ? new Date(d).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : '—';
const fmtFechaLarga = d => d ? new Date(d).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}) : '';
const fmtFechaCorta = d => d ? new Date(d).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'}) : '';

// Colores por disponibilidad
const dispColor = { disponible:'#22c55e', pocos:'#eab308', llena:'#ef4444' };
const dispLabel = { disponible:'Disponible', pocos:'Pocos cupos', llena:'Llena' };

/* ✅ FIX: iconos SVG usados en JSX (evita "Ico is not defined") */
const Ico = {
    gym: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6v12"/><path d="M18 6v12"/><path d="M3 9h3"/><path d="M18 9h3"/><path d="M3 15h3"/><path d="M18 15h3"/><path d="M9 12h6"/>
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
    ),
    wait: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    pin: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
    ),
    cal: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    list: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
        </svg>
    ),
};

// ── NeonSelect con portal (fix dropdown cortado) ──────────────────────────────
function NeonSelect({ value, onChange, options, placeholder='Todos' }) {
    const [open,setOpen]     = useState(false);
    const [pos,setPos]       = useState({top:0,left:0,width:0});
    const btnRef = useRef(null), dropRef = useRef(null);

    const openDrop = useCallback(() => {
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            const dropH = Math.min(options.length*44+8,240);
            const above = window.innerHeight-r.bottom < dropH && r.top > dropH;
            setPos({ top: above ? r.top-dropH-4 : r.bottom+4, left:r.left, width:r.width });
        }
        setOpen(o=>!o);
    },[options.length]);

    useEffect(() => {
        if (!open) return;
        const h = e => {
            if (btnRef.current&&!btnRef.current.contains(e.target)&&
                dropRef.current&&!dropRef.current.contains(e.target)) setOpen(false);
        };
        const onScroll = () => setOpen(false);
        document.addEventListener('mousedown',h);
        document.addEventListener('scroll',onScroll,true);
        return () => { document.removeEventListener('mousedown',h); document.removeEventListener('scroll',onScroll,true); };
    },[open]);

    const sel = options.find(o=>String(o.value)===String(value));

    return (
        <>
            <button ref={btnRef} type="button" onClick={openDrop}
                    className={`ns-btn ${open?'open':''}`}>
                <span className={sel?'ns-val':'ns-ph'}>
                    {sel ? (
                        <span style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                            {sel.dot && <span className="ns-dot" style={{background:sel.dot}}/>}
                            {sel.label}
                        </span>
                    ) : placeholder}
                </span>
                <span className={`ns-arr ${open?'up':''}`}>›</span>
            </button>
            {open && createPortal(
                <div ref={dropRef} className="ns-drop"
                     style={{position:'fixed',top:pos.top,left:pos.left,width:pos.width,zIndex:99999}}>
                    <button type="button" className="ns-opt ns-opt-empty"
                            onClick={()=>{onChange('');setOpen(false);}}>
                        {placeholder}
                    </button>
                    {options.map(o=>(
                        <button type="button" key={o.value}
                                className={`ns-opt ${String(value)===String(o.value)?'active':''}`}
                                onClick={()=>{onChange(o.value);setOpen(false);}}>
                            {o.dot && <span className="ns-dot" style={{background:o.dot}}/>}
                            <span className="ns-opt-lbl">{o.label}</span>
                            {String(value)===String(o.value)&&<span className="ns-chk">✓</span>}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}

// ── Calendario mensual ────────────────────────────────────────────────────────
function BigCalendar({ selectedDate, onSelectDate, clasesMap, viewMonth, onPrev, onNext }) {
    const sel   = parseYMD(selectedDate);
    const today = new Date(); today.setHours(0,0,0,0);
    const firstDay = new Date(viewMonth.year,viewMonth.month,1);
    const lastDay  = new Date(viewMonth.year,viewMonth.month+1,0);
    const startPad = firstDay.getDay()===0?6:firstDay.getDay()-1;
    const cells=[];
    for(let i=0;i<startPad;i++) cells.push(null);
    for(let d=1;d<=lastDay.getDate();d++) cells.push(new Date(viewMonth.year,viewMonth.month,d));
    while(cells.length%7!==0) cells.push(null);
    const weeks=[]; for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));

    return (
        <div className="bcal">
            <div className="bcal-nav">
                <button className="bcal-nb" onClick={onPrev}>‹</button>
                <h2 className="bcal-title">{MESES[viewMonth.month]} <span className="bcal-yr">{viewMonth.year}</span></h2>
                <button className="bcal-nb" onClick={onNext}>›</button>
            </div>
            <div className="bcal-dow-row">
                {DIAS_CORTO.map(d=><div key={d} className="bcal-dow">{d}</div>)}
            </div>
            <div className="bcal-body">
                {weeks.map((week,wi)=>(
                    <div key={wi} className="bcal-week">
                        {week.map((d,di)=>{
                            if(!d) return <div key={`e-${wi}-${di}`} className="bcal-cell empty"/>;
                            const isSel=isSameDay(d,sel), isTod=isSameDay(d,today);
                            const lista = clasesMap[toYMD(d)]??[];
                            const cnt   = lista.length;
                            // Dot color: verde si tiene clases disponibles, rosa si todas llenas
                            const hayDisp = lista.some(c=>c.cupos_disponibles>0);
                            const dotColor = cnt>0 ? (hayDisp?'#22c55e':'#ef4444') : null;
                            return (
                                <button key={toYMD(d)} onClick={()=>onSelectDate(toYMD(d))}
                                        className={`bcal-cell ${isSel?'sel':''} ${isTod&&!isSel?'tod':''}`}>
                                    <span className="bcal-num">{d.getDate()}</span>
                                    {cnt>0&&(
                                        <div className="bcal-dots">
                                            {Array.from({length:Math.min(cnt,3)}).map((_,i)=>(
                                                <span key={i} className="bdot"
                                                      style={{background:isSel?'rgba(0,0,0,0.5)':dotColor}}/>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Strip semanal ─────────────────────────────────────────────────────────────
function WeekStrip({ selectedDate, onSelectDate, clasesMap }) {
    const sel   = parseYMD(selectedDate);
    const today = new Date(); today.setHours(0,0,0,0);
    const week  = useMemo(()=>{
        const mon=startOfWeekMon(sel);
        return Array.from({length:7},(_,i)=>addDays(mon,i));
    },[selectedDate]);

    return (
        <div className="wstrip">
            <button className="wstrip-nav" onClick={()=>onSelectDate(toYMD(addDays(parseYMD(selectedDate),-7)))}>‹</button>
            <div className="wstrip-days">
                {week.map(d=>{
                    const ymd=toYMD(d), isSel=isSameDay(d,sel), isTod=isSameDay(d,today);
                    const lista=clasesMap[ymd]??[];
                    const dot=lista.length>0;
                    const hayDisp=lista.some(c=>c.cupos_disponibles>0);
                    return (
                        <button key={ymd} onClick={()=>onSelectDate(ymd)}
                                className={`wday ${isSel?'sel':''} ${isTod&&!isSel?'tod':''}`}>
                            <span className="wday-dow">{DIAS_CORTO[d.getDay()===0?6:d.getDay()-1]}</span>
                            <span className="wday-num">{d.getDate()}</span>
                            {dot&&<span className="wdot" style={{background:isSel?'rgba(0,0,0,0.5)':(hayDisp?'#22c55e':'#ef4444')}}/>}
                        </button>
                    );
                })}
            </div>
            <button className="wstrip-nav" onClick={()=>onSelectDate(toYMD(addDays(parseYMD(selectedDate),7)))}>›</button>
        </div>
    );
}

// ── Tarjeta de clase para el cliente ─────────────────────────────────────────
function ClaseCardCliente({ clase, onReservar, loadingId }) {
    const llena  = clase.cupos_disponibles<=0;
    const pocos  = !llena && clase.cupos_disponibles<=3;
    const disp   = llena?'llena':pocos?'pocos':'disponible';
    const color  = dispColor[disp];
    const pct    = clase.capacidad_maxima>0
        ? Math.round((clase.total_reservas/clase.capacidad_maxima)*100) : 0;
    const loading = loadingId===clase.id;

    return (
        <div className={`cc ${clase.ya_reservo?'cc-reservada':''} ${clase.en_espera?'cc-espera':''}`}
             style={{'--tc': clase.tipo_clase?.color??'#FF1493'}}>
            <div className="cc-bar" style={{background:clase.tipo_clase?.color??'#FF1493'}}/>
            <div className="cc-body">
                {/* Top row */}
                <div className="cc-top">
                    <div className="cc-info">
                        <div className="cc-name-row">
                            <span className="cc-name">{clase.tipo_clase?.nombre??'—'}</span>
                        </div>
                        <span className="cc-time">{fmtHora(clase.fecha_hora_inicio)} — {fmtHora(clase.fecha_hora_fin)}</span>
                        <div className="cc-instructor">
                            <span className="ico-sm" style={{color:'rgba(255,20,147,0.6)',width:'13px',height:'13px'}}>{Ico.user}</span>
                            <span className="cc-sub">{clase.instructor?.name??'—'}</span>
                        </div>
                        {clase.sala && (
                            <div className="cc-location">
                                <span className="ico-sm" style={{color:'rgba(255,20,147,0.6)',width:'13px',height:'13px'}}>{Ico.pin}</span>
                                <span className="cc-sub">{clase.sala}</span>
                            </div>
                        )}
                    </div>
                    <div className="cc-meta">
                        {/* Badge disponibilidad */}
                        {!clase.ya_reservo && !clase.en_espera && (
                            <span className="disp-badge" style={{background:`${color}22`,color,border:`1px solid ${color}44`}}>
                                {dispLabel[disp]}
                            </span>
                        )}
                        {/* Cupos */}
                        <div className="cc-cupos">
                            <span style={{color:clase.tipo_clase?.color??'#FF1493',fontWeight:900}}>
                                {clase.total_reservas}/{clase.capacidad_maxima}
                            </span>
                            <span className="cupos-lbl">cupos</span>
                        </div>
                        {/* En espera total */}
                        {llena && clase.total_espera>0 && (
                            <span className="espera-txt">{clase.total_espera} en espera</span>
                        )}
                    </div>
                </div>

                {/* Barra ocupación */}
                <div className="ocp-track">
                    <div className="ocp-fill" style={{
                        width:`${Math.min(pct,100)}%`,
                        background: pct>=90?'#ef4444':pct>=60?'#eab308':(clase.tipo_clase?.color??'#FF1493'),
                    }}/>
                </div>

                {/* Botón acción */}
                <div className="cc-action">
                    {clase.ya_reservo ? (
                        <div className="cc-confirmada">
                            <span className="ico-sm">{Ico.check}</span>
                            <span>Reserva confirmada</span>
                        </div>
                    ) : clase.en_espera ? (
                        <div className="cc-en-espera">
                            <span className="ico-sm">{Ico.wait}</span>
                            <span>En lista de espera #{clase.posicion_espera}</span>
                        </div>
                    ) : llena ? (
                        <button className="btn-espera" onClick={()=>onReservar(clase.id)} disabled={loading}>
                            {loading ? 'Procesando...' : 'Lista de espera'}
                        </button>
                    ) : (
                        <button className="btn-reservar" onClick={()=>onReservar(clase.id)} disabled={loading}>
                            {loading ? 'Procesando...' : 'Reservar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ClienteClases({ user, clases, tiposClase, filters }) {
    const { props } = usePage();
    const flash = props.flash??{};

    const today = new Date(); today.setHours(0,0,0,0);

    const hasFechaFiltro = !!filters?.fecha;

    const [selectedDate, setSelectedDate] = useState(filters?.fecha || toYMD(today));
    const [calView,      setCalView]      = useState('month');
    const [viewMonth,    setViewMonth]    = useState(()=>{
        const d = parseYMD(filters?.fecha||toYMD(today));
        return { year:d.getFullYear(), month:d.getMonth() };
    });
    const [tipoFiltro,  setTipoFiltro]  = useState(filters?.tipo_clase_id??'');
    const [dispFiltro,  setDispFiltro]  = useState(filters?.disponibilidad??'');
    const [mainView,    setMainView]    = useState('calendario'); // 'calendario' | 'todas'
    const [loadingId,   setLoadingId]   = useState(null);
    const [flashMsg,    setFlashMsg]    = useState(null);
    const [lastUpdate,  setLastUpdate]  = useState(new Date());
    const [claseResaltada, setClaseResaltada] = useState(null);

    // Resaltar clase desde URL ?clase_id=
    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        const cid = params.get('clase_id');
        if (cid) {
            const id = parseInt(cid);
            setClaseResaltada(id);
            setTimeout(()=>{ const el=document.getElementById(`cc-${id}`); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); },400);
            setTimeout(()=>setClaseResaltada(null),5000);
        }
    },[]);

    // Flash message
    useEffect(()=>{
        if (flash.success) { setFlashMsg({type:'success',msg:flash.success}); }
        if (flash.error)   { setFlashMsg({type:'error',  msg:flash.error  }); }
    },[flash.success, flash.error]);

    // Polling 30s
    useEffect(()=>{
        const id=setInterval(()=>{
            router.reload({only:['clases'],preserveState:true,preserveScroll:true});
            setLastUpdate(new Date());
        },30000);
        return ()=>clearInterval(id);
    },[]);

    // Indexar clases por fecha
    const clasesMap = useMemo(()=>{
        const m={};
        clases.data?.forEach(c=>{
            if (!c.fecha_hora_inicio) return;
            const ymd=toDatetimeLocal(c.fecha_hora_inicio).slice(0,10);
            if (!m[ymd]) m[ymd]=[];
            m[ymd].push(c);
        });
        return m;
    },[clases.data]);

    // Clases del día seleccionado
    const clasesDia = useMemo(()=>{
        const lista = clasesMap[selectedDate]??[];
        return lista
            .filter(c=>!tipoFiltro || String(c.tipo_clase_id)===String(tipoFiltro))
            .filter(c=>!dispFiltro || c.estado_disponibilidad===dispFiltro)
            .sort((a,b)=>new Date(a.fecha_hora_inicio)-new Date(b.fecha_hora_inicio));
    },[clasesMap,selectedDate,tipoFiltro,dispFiltro]);

    // Todas las clases filtradas
    const todasClases = useMemo(()=>{
        return (clases.data??[])
            .filter(c=>!tipoFiltro || String(c.tipo_clase_id)===String(tipoFiltro))
            .filter(c=>!dispFiltro || c.estado_disponibilidad===dispFiltro)
            .sort((a,b)=>new Date(a.fecha_hora_inicio)-new Date(b.fecha_hora_inicio));
    },[clases.data,tipoFiltro,dispFiltro]);

    // Conteo de clases disponibles/llenas en el día
    const statsDia = useMemo(()=>({
        total:     clasesDia.length,
        disponible:clasesDia.filter(c=>c.cupos_disponibles>0).length,
        reservadas:clasesDia.filter(c=>c.ya_reservo).length,
        llenas:    clasesDia.filter(c=>c.cupos_disponibles<=0).length,
    }),[clasesDia]);

    const handleSelectDate = d=>{
        setSelectedDate(d);
        const pd=parseYMD(d);
        setViewMonth({year:pd.getFullYear(),month:pd.getMonth()});
        router.get('/cliente/clases',{
            fecha:d,
            tipo_clase_id:tipoFiltro||undefined,
            disponibilidad:dispFiltro||undefined,
        },{preserveState:true,replace:true});
    };

    const handleReservar = claseId=>{
        setLoadingId(claseId);
        router.post('/cliente/clases/reservar',{clase_id:claseId},{
            onSuccess: page=>{
                const msg = page.props.flash?.success ?? '¡Reserva confirmada!';
                setFlashMsg({type:'success',msg});
                setLoadingId(null);
            },
            onError: e=>{
                setFlashMsg({type:'error',msg:Object.values(e)[0]});
                setLoadingId(null);
            },
        });
    };

    const prevMonth = ()=>setViewMonth(v=>{ const d=new Date(v.year,v.month-1,1); return {year:d.getFullYear(),month:d.getMonth()}; });
    const nextMonth = ()=>setViewMonth(v=>{ const d=new Date(v.year,v.month+1,1); return {year:d.getFullYear(),month:d.getMonth()}; });

    const selParsed = parseYMD(selectedDate);
    const isToday   = isSameDay(selParsed,today);
    const dayLabel  = fmtFechaLarga(selParsed);

    const tiposOpts = tiposClase.map(t=>({value:t.id,label:t.nombre,dot:t.color}));
    const dispOpts  = [
        {value:'disponible',label:'Disponible'},
        {value:'pocos',     label:'Pocos cupos'},
        {value:'llena',     label:'Llena'},
    ];

    // Si no hay fecha filtrada y el día seleccionado no tiene clases,
    // saltar al primer día disponible para que sí se vean en pantalla.
    useEffect(() => {
        if (hasFechaFiltro) return;
        const currentHas = (clasesMap[selectedDate]?.length ?? 0) > 0;
        if (currentHas) return;

        const keys = Object.keys(clasesMap).sort(); // YYYY-MM-DD ordena bien
        if (!keys.length) return;

        const first = keys[0];
        setSelectedDate(first);
        const d = parseYMD(first);
        setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
    }, [clasesMap, selectedDate, hasFechaFiltro]);

    return (
        <ClienteLayout user={user}>
            <Head title="Clases Disponibles"/>

            <div className="cr">

                {/* ── Header ── */}
                <div className="cr-hd">
                    <div>
                        <h1 className="cr-title"><span className="ico-lg">{Ico.cal}</span> Clases</h1>
                        {mainView==='calendario' && (
                            <p className="cr-sub">
                                {isToday&&<span className="hoy-chip">Hoy</span>}
                                <span style={{textTransform:'capitalize'}}>{dayLabel}</span>
                            </p>
                        )}
                        {mainView==='todas' && (
                            <p className="cr-sub">{clases.data?.length??0} clases disponibles</p>
                        )}
                    </div>
                    <div className="hd-right">
                        <div className="live-ind">
                            <span className="live-dot"/>
                            <span className="live-txt">
                                {lastUpdate.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
                            </span>
                            <button className="refresh-btn" onClick={()=>{ router.reload({only:['clases'],preserveState:true,preserveScroll:true}); setLastUpdate(new Date()); }} title="Actualizar">↻</button>
                        </div>
                    </div>
                </div>

                {/* ── Flash Modal ── */}
                {flashMsg && (
                    <div className="flash-overlay">
                        <div className={`flash-modal ${flashMsg.type}`}>
                            <div className="flash-header">
                                <div className="flash-content">
                                    <span className="flash-ico">{flashMsg.type==='success'?Ico.check:Ico.wait}</span>
                                    <p className="flash-text">{flashMsg.msg}</p>
                                </div>
                                <button className="flash-close" onClick={()=>setFlashMsg(null)}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tabs vista principal ── */}
                <div className="main-tabs">
                    <button className={`mtab ${mainView==='calendario'?'act':''}`} onClick={()=>setMainView('calendario')}><span className="ico-sm">{Ico.cal}</span> Calendario</button>
                    <button className={`mtab ${mainView==='todas'?'act':''}`}      onClick={()=>setMainView('todas')}><span className="ico-sm">{Ico.list}</span> Todas las Clases</button>
                </div>

                {/* ══════════════════════════════════════════════
                    VISTA CALENDARIO
                ══════════════════════════════════════════════ */}
                {mainView==='calendario' && (
                    <>
                        <div className="view-tabs">
                            <button className={`vtab ${calView==='month'?'act':''}`} onClick={()=>setCalView('month')}>Mes</button>
                            <button className={`vtab ${calView==='week' ?'act':''}`} onClick={()=>setCalView('week')}>Semana</button>
                        </div>

                        <div className="cr-layout">
                            {/* Columna calendario */}
                            <div className="cr-cal-col">
                                <div className="cal-card">
                                    {calView==='month' ? (
                                        <BigCalendar
                                            selectedDate={selectedDate}
                                            onSelectDate={handleSelectDate}
                                            clasesMap={clasesMap}
                                            viewMonth={viewMonth}
                                            onPrev={prevMonth}
                                            onNext={nextMonth}
                                        />
                                    ) : (
                                        <div style={{padding:'1.25rem 1.25rem 0.5rem'}}>
                                            <WeekStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} clasesMap={clasesMap}/>
                                        </div>
                                    )}

                                    <div className="cal-bottom">
                                        {/* Leyenda */}
                                        <div className="legend-row">
                                            <div className="leg-item"><span className="leg-dot" style={{background:'#22c55e'}}/><span className="leg-txt">Con cupos</span></div>
                                            <div className="leg-item"><span className="leg-dot" style={{background:'#ef4444'}}/><span className="leg-txt">Sin cupos</span></div>
                                            <div className="leg-item"><span className="leg-dot" style={{background:'#eab308'}}/><span className="leg-txt">Pocos cupos</span></div>
                                        </div>
                                        {/* Filtros */}
                                        <div className="filters-grid">
                                            <div className="fg">
                                                <label className="flbl-sm">Tipo</label>
                                                <NeonSelect value={tipoFiltro} onChange={setTipoFiltro} options={tiposOpts} placeholder="Todos"/>
                                            </div>
                                            <div className="fg">
                                                <label className="flbl-sm">Disponibilidad</label>
                                                <NeonSelect value={dispFiltro} onChange={setDispFiltro} options={dispOpts} placeholder="Todas"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna lista del día */}
                            <div className="cr-list-col">
                                {/* Stats del día */}
                                <div className="day-stats">
                                    <div className="dstat"><span className="dstat-n">{statsDia.total}</span><span className="dstat-l">Clases</span></div>
                                    <div className="dstat"><span className="dstat-n" style={{color:'#22c55e'}}>{statsDia.disponible}</span><span className="dstat-l">Disponibles</span></div>
                                    <div className="dstat"><span className="dstat-n" style={{color:'#4ade80'}}>{statsDia.reservadas}</span><span className="dstat-l">Reservadas</span></div>
                                    <div className="dstat"><span className="dstat-n" style={{color:'#ef4444'}}>{statsDia.llenas}</span><span className="dstat-l">Llenas</span></div>
                                </div>

                                {/* Lista clases */}
                                <div className="clases-list">
                                    {clasesDia.length===0 ? (
                                        <div className="empty-day">
                                            <span className="empty-ico-svg">{Ico.gym}</span>
                                            <p className="empty-txt">No hay clases para este día</p>
                                            <p className="empty-sub">Prueba seleccionando otro día en el calendario</p>
                                        </div>
                                    ) : clasesDia.map(c=>(
                                        <div key={c.id} id={`cc-${c.id}`}
                                             className={claseResaltada===c.id?'cc-highlight-wrap':''}>
                                            <ClaseCardCliente clase={c} onReservar={handleReservar} loadingId={loadingId}/>
                                        </div>
                                    ))}
                                </div>

                                {/* Paginación */}
                                {(clases.last_page??1) > 1 && (
                                    <div className="pagination">
                                        {clases.links.map((link,i)=>(
                                            <button key={i} disabled={!link.url}
                                                    onClick={()=>link.url&&router.get(link.url)}
                                                    dangerouslySetInnerHTML={{__html:link.label}}
                                                    className={`pg-btn ${link.active?'act':''}`}
                                                    style={{opacity:link.url?1:0.4}}/>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════
                    VISTA TODAS LAS CLASES
                ══════════════════════════════════════════════ */}
                {mainView==='todas' && (
                    <div className="todas-layout">

                        {/* Filtros */}
                        <div className="todas-filters">
                            <div className="fg" style={{minWidth:160}}>
                                <label className="flbl-sm">Tipo de clase</label>
                                <NeonSelect value={tipoFiltro} onChange={setTipoFiltro} options={tiposOpts} placeholder="Todos"/>
                            </div>
                            <div className="fg" style={{minWidth:160}}>
                                <label className="flbl-sm">Disponibilidad</label>
                                <NeonSelect value={dispFiltro} onChange={setDispFiltro} options={dispOpts} placeholder="Todas"/>
                            </div>
                        </div>

                        {/* Chips rápidos de disponibilidad */}
                        <div className="disp-chips">
                            {[
                                {v:'',    l:'Todas',       color:'#FF1493'},
                                {v:'disponible',l:'Disponible', color:'#22c55e'},
                                {v:'pocos',     l:'Pocos cupos',color:'#eab308'},
                                {v:'llena',     l:'Llena',      color:'#ef4444'},
                            ].map(c=>(
                                <button key={c.v}
                                        className={`dchip ${dispFiltro===c.v?'act':''}`}
                                        style={dispFiltro===c.v?{background:`${c.color}22`,borderColor:c.color,color:c.color}:{}}
                                        onClick={()=>setDispFiltro(c.v)}>
                                    <span className="dchip-dot" style={{background:c.color}}/>
                                    {c.l}
                                </button>
                            ))}
                        </div>

                        {/* Lista */}
                        {todasClases.length===0 ? (
                            <div className="empty-day">
                                <span className="empty-ico-svg">{Ico.gym}</span>
                                <p className="empty-txt">No hay clases disponibles</p>
                            </div>
                        ) : (
                            <div className="todas-list">
                                {todasClases.map(c=>(
                                    <div key={c.id} id={`cc-${c.id}`}
                                         className={claseResaltada===c.id?'cc-highlight-wrap':''}>
                                        {/* Etiqueta de fecha en modo todas */}
                                        <div className="todas-fecha-lbl">{fmtFechaCorta(c.fecha_hora_inicio)}</div>
                                        <ClaseCardCliente clase={c} onReservar={handleReservar} loadingId={loadingId}/>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Paginación */}
                        {(clases.last_page??1) > 1 && (
                            <div className="pagination">
                                {clases.links.map((link,i)=>(
                                    <button key={i} disabled={!link.url}
                                            onClick={()=>link.url&&router.get(link.url)}
                                            dangerouslySetInnerHTML={{__html:link.label}}
                                            className={`pg-btn ${link.active?'act':''}`}
                                            style={{opacity:link.url?1:0.4}}/>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── SVG Icons (fix Ico undefined) ───────────────────────────────────────── */}
            <div style={{display:'none'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6v12"/><path d="M18 6v12"/><path d="M3 9h3"/><path d="M18 9h3"/><path d="M3 15h3"/><path d="M18 15h3"/><path d="M9 12h6"/>
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
                </svg>
            </div>

            <style>{`
/* ── Root ── */
*{box-sizing:border-box;}
.cr{max-width:1300px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;}

/* Header */
.cr-hd{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;}
.cr-title{font-size:clamp(1.8rem,5vw,2.4rem);font-weight:900;color:#FF1493;margin:0;letter-spacing:1px;text-shadow:0 0 20px rgba(255,20,147,0.5);}
.ico-lg{width:1.4em;height:1.4em;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;color:#FF1493;filter:drop-shadow(0 0 8px rgba(255,20,147,0.6));}
.ico-lg svg{width:100%;height:100%;}

/* Flash Modal - Ventana emergente centrada */
.flash-overlay{
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background:rgba(0,0,0,0.7);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
    backdrop-filter:blur(4px);
    -webkit-backdrop-filter:blur(4px);
    animation:fadeIn 0.25s ease;
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.flash-modal{
    display:flex;
    flex-direction:column;
    width:auto;
    max-width:min(420px,calc(100vw - 40px));
    border-radius:12px;
    box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 40px rgba(255,20,147,0.2);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,20,147,0.2);
    overflow:hidden;
    animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.flash-modal.success{background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.3);}
.flash-modal.error{background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.3);}
.flash-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;padding:1.5rem;}
.flash-content{display:flex;align-items:flex-start;gap:1rem;flex:1;min-width:0;}
.flash-ico{display:flex;width:24px;height:24px;flex-shrink:0;color:#FF1493;margin-top:0.1rem;}
.flash-modal.success .flash-ico{color:#4ade80;}
.flash-modal.error .flash-ico{color:#fca5a5;}
.flash-text{color:#fff;font-size:0.9rem;font-weight:600;line-height:1.5;margin:0;word-break:break-word;}
.flash-close{
    background:rgba(255,255,255,0.1);
    border:1px solid rgba(255,255,255,0.2);
    border-radius:6px;
    width:28px;
    height:28px;
    display:flex;
    align-items:center;
    justify-content:center;
    color:rgba(255,255,255,0.6);
    cursor:pointer;
    font-size:1rem;
    font-weight:bold;
    transition:all 0.2s;
    padding:0;
    font-family:inherit;
    flex-shrink:0;
}
.flash-close:hover{background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);}

/* Tabs */
.main-tabs{display:flex;gap:0.35rem;background:rgba(255,20,147,0.04);border:1px solid rgba(255,20,147,0.15);border-radius:12px;padding:0.3rem;width:fit-content;}
.mtab{display:flex;align-items:center;gap:.35rem;background:none;border:none;color:rgba(255,255,255,0.4);padding:0.55rem 1.2rem;border-radius:9px;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
.mtab.act{background:rgba(255,20,147,0.18);border:1px solid rgba(255,20,147,0.4);color:#FF1493;}
.mtab:hover:not(.act){color:rgba(255,20,147,0.7);}

.view-tabs{display:flex;gap:0.35rem;}
.vtab{background:rgba(255,20,147,0.04);border:1px solid rgba(255,20,147,0.15);color:rgba(255,255,255,0.4);padding:0.45rem 1rem;border-radius:9px;font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
.vtab.act{background:rgba(255,20,147,0.15);border-color:rgba(255,20,147,0.4);color:#FF1493;}

/* Layout 2 cols */
.cr-layout{display:grid;grid-template-columns:420px 1fr;gap:1.25rem;align-items:start;}

/* Calendar card */
.cal-card{background:rgba(255,20,147,0.03);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,20,147,0.2);border-radius:20px;overflow:visible;box-shadow:0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,20,147,0.1);position:sticky;top:80px;}

/* ═══ CALENDARIO ═══ */
.bcal{padding:1.5rem 1.5rem 1rem;}
.bcal-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;}
.bcal-nb{background:rgba(255,20,147,0.08);border:1px solid rgba(255,20,147,0.25);color:#FF1493;width:36px;height:36px;border-radius:10px;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
.bcal-nb:hover{background:rgba(255,20,147,0.2);}
.bcal-title{color:#fff;font-size:1.25rem;font-weight:900;margin:0;}
.bcal-yr{color:rgba(255,20,147,0.65);font-size:0.9rem;font-weight:600;margin-left:0.35rem;}
.bcal-dow-row{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:0.3rem;}
.bcal-dow{text-align:center;color:rgba(255,20,147,0.6);font-size:0.65rem;font-weight:800;padding:0.4rem 0;letter-spacing:1px;text-transform:uppercase;}
.bcal-body{display:flex;flex-direction:column;gap:2px;}
.bcal-week{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.bcal-cell{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:none;border:none;color:rgba(255,255,255,0.65);border-radius:10px;cursor:pointer;transition:all 0.15s;padding:0.15rem;min-height:44px;}
.bcal-cell:not(.empty):hover:not(.sel){background:rgba(255,20,147,0.1);color:#FF1493;}
.bcal-cell.empty{cursor:default;}
.bcal-cell.tod .bcal-num{color:#FF1493;font-weight:900;background:rgba(255,20,147,0.12);border:1.5px solid rgba(255,20,147,0.45);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;}
.bcal-cell.sel{background:#FF1493!important;color:#000!important;box-shadow:0 2px 14px rgba(255,20,147,0.5);}
.bcal-cell.sel .bcal-num{color:#000!important;font-weight:900;}
.bcal-num{font-size:0.85rem;font-weight:500;line-height:1;}
.bcal-dots{display:flex;gap:3px;}
.bdot{width:5px;height:5px;border-radius:50%;}

/* Week strip */
.wstrip{display:flex;align-items:center;gap:0.3rem;}
.wstrip-nav{background:rgba(255,20,147,0.08);border:1px solid rgba(255,20,147,0.2);color:#FF1493;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;}
.wstrip-nav:hover{background:rgba(255,20,147,0.2);}
.wstrip-days{flex:1;display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.wday{display:flex;flex-direction:column;align-items:center;gap:3px;padding:0.7rem 0.2rem;border-radius:12px;border:none;background:none;cursor:pointer;transition:all 0.15s;}
.wday:hover:not(.sel){background:rgba(255,20,147,0.08);}
.wday.tod .wday-num{color:#FF1493;font-weight:900;}
.wday.tod .wday-dow{color:rgba(255,20,147,0.7);}
.wday.sel{background:#FF1493!important;}
.wday.sel .wday-dow,.wday.sel .wday-num{color:#000!important;}
.wday-dow{font-size:0.58rem;font-weight:800;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;}
.wday-num{font-size:1rem;font-weight:600;color:rgba(255,255,255,0.8);}
.wdot{width:5px;height:5px;border-radius:50%;}

/* Cal bottom */
.cal-bottom{padding:1rem 1.5rem 1.5rem;border-top:1px solid rgba(255,20,147,0.1);display:flex;flex-direction:column;gap:0.875rem;}
.legend-row{display:flex;flex-wrap:wrap;gap:0.6rem;}
.leg-item{display:flex;align-items:center;gap:0.4rem;}
.leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.leg-txt{color:rgba(255,255,255,0.45);font-size:0.7rem;}
.filters-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;}
.flbl-sm{color:rgba(255,20,147,0.8);font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:0.3rem;}
.fg{display:flex;flex-direction:column;gap:0.35rem;}

/* Neon Select */
.ns-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.875rem;background:rgba(255,20,147,0.05);border:1px solid rgba(255,20,147,0.2);border-radius:10px;color:rgba(255,255,255,0.8);font-size:0.82rem;cursor:pointer;transition:all 0.2s;text-align:left;gap:0.5rem;font-family:inherit;}
.ns-btn:hover,.ns-btn.open{border-color:rgba(255,20,147,0.55);background:rgba(255,20,147,0.08);}
.ns-val{color:#fff;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ns-ph{color:rgba(255,255,255,0.3);flex:1;}
.ns-arr{color:rgba(255,20,147,0.7);font-size:1rem;flex-shrink:0;transform:rotate(90deg);transition:transform 0.2s;display:inline-block;}
.ns-arr.up{transform:rotate(-90deg);}
.ns-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0;}
.ns-drop{background:rgba(8,3,14,0.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,20,147,0.35);border-radius:12px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.75),0 0 30px rgba(255,20,147,0.1);max-height:240px;overflow-y:auto;animation:nsdrop 0.15s cubic-bezier(.34,1.56,.64,1);}
@keyframes nsdrop{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.ns-opt{width:100%;display:flex;align-items:center;gap:0.55rem;padding:0.65rem 0.875rem;background:none;border:none;border-bottom:1px solid rgba(255,20,147,0.07);color:rgba(255,255,255,0.7);font-size:0.82rem;font-weight:500;text-align:left;cursor:pointer;transition:all 0.15s;font-family:inherit;}
.ns-opt:last-child{border-bottom:none;}
.ns-opt:hover{background:rgba(255,20,147,0.1);color:#FF1493;}
.ns-opt.active{background:rgba(255,20,147,0.13);color:#FF1493;font-weight:700;}
.ns-opt-empty{color:rgba(255,255,255,0.3);font-style:italic;}
.ns-opt-lbl{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ns-chk{margin-left:auto;color:#FF1493;font-size:0.75rem;}
.ns-drop::-webkit-scrollbar{width:4px;}
.ns-drop::-webkit-scrollbar-track{background:transparent;}
.ns-drop::-webkit-scrollbar-thumb{background:rgba(255,20,147,0.3);border-radius:4px;}

/* Lista día */
.cr-list-col{display:flex;flex-direction:column;gap:0.8rem;}
.day-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0.55rem;}
.dstat{background:rgba(255,20,147,0.04);border:1px solid rgba(255,20,147,0.14);border-radius:10px;padding:0.6rem 0.5rem;text-align:center;}
.dstat-n{display:block;color:#FF1493;font-size:1.35rem;font-weight:900;line-height:1;}
.dstat-l{display:block;color:rgba(255,255,255,0.3);font-size:0.52rem;text-transform:uppercase;letter-spacing:0.8px;margin-top:0.18rem;}

/* Tarjeta clase cliente - compacta */
.cc{display:flex;background:rgba(255,20,147,0.03);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,20,147,0.14);border-radius:12px;overflow:hidden;transition:all 0.2s;box-shadow:0 1px 8px rgba(0,0,0,0.25);}
.cc:hover{border-color:var(--tc,#FF1493);box-shadow:0 3px 16px rgba(255,20,147,0.12);transform:none;}
.cc-reservada{border-color:rgba(34,197,94,0.3)!important;}
.cc-reservada:hover{border-color:#22c55e!important;box-shadow:0 3px 14px rgba(34,197,94,0.12)!important;}
.cc-espera{border-color:rgba(234,179,8,0.3)!important;}
.cc-bar{width:3px;flex-shrink:0;}
.cc-body{flex:1;padding:0.65rem 0.75rem;min-width:0;display:flex;flex-direction:column;gap:0.38rem;}
.cc-top{display:flex;justify-content:space-between;gap:0.55rem;}
.cc-info{display:flex;flex-direction:column;gap:0.14rem;min-width:0;flex:1;}
.cc-name-row{display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;}
.cc-name{color:#fff;font-weight:800;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.badge-ok  {background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);color:#4ade80;font-size:0.54rem;font-weight:800;padding:0.08rem 0.35rem;border-radius:18px;}
.badge-wait{background:rgba(234,179,8,0.15); border:1px solid rgba(234,179,8,0.4); color:#fbbf24;font-size:0.54rem;font-weight:800;padding:0.08rem 0.35rem;border-radius:18px;}
.cc-time{color:rgba(255,255,255,0.5);font-size:0.76rem;line-height:1.15;font-weight:600;}
.cc-instructor,.cc-location{display:flex;align-items:center;gap:0.32rem;color:rgba(255,255,255,0.5);font-size:0.74rem;line-height:1.15;}
.cc-sub{color:rgba(255,255,255,0.5);font-size:0.74rem;line-height:1.15;}
.cc-meta{display:flex;flex-direction:column;align-items:flex-end;gap:0.32rem;flex-shrink:0;}
.disp-badge{padding:0.16rem 0.38rem;border-radius:5px;font-size:0.52rem;font-weight:700;white-space:nowrap;}
.cc-cupos{text-align:right;font-size:0.8rem;}
.cupos-lbl{display:block;color:rgba(255,255,255,0.22);font-size:0.48rem;text-transform:uppercase;letter-spacing:0.4px;}
.espera-txt{color:#fbbf24;font-size:0.62rem;font-weight:600;}
.ocp-track{height:2px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;}
.ocp-fill{height:100%;border-radius:2px;transition:width 0.4s ease;}

/* Botones acción */
.cc-action{margin-top:0.12rem;}
.btn-reservar{width:100%;background:linear-gradient(135deg,#FF1493,#C71585);color:#000;border:none;border-radius:8px;padding:0.5rem 0.75rem;font-weight:900;font-size:0.75rem;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 10px rgba(255,20,147,0.25);}
.btn-reservar:hover:not(:disabled){box-shadow:0 3px 12px rgba(255,20,147,0.32);}
.btn-reservar:disabled{opacity:0.6;cursor:not-allowed;}
.btn-espera{width:100%;background:rgba(234,179,8,0.08);border:1.5px solid rgba(234,179,8,0.4);color:#fbbf24;border-radius:8px;padding:0.5rem 0.75rem;font-weight:700;font-size:0.75rem;cursor:pointer;transition:all 0.2s;}
.btn-espera:hover:not(:disabled){background:rgba(234,179,8,0.14);}
.btn-espera:disabled{opacity:0.6;cursor:not-allowed;}
.cc-confirmada{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:0.5rem;text-align:center;color:#4ade80;font-weight:700;font-size:0.75rem;display:flex;align-items:center;justify-content:center;gap:0.4rem;}
.cc-confirmada .ico-sm{width:14px;height:14px;}
.cc-en-espera{background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:8px;padding:0.5rem;text-align:center;color:#fbbf24;font-weight:700;font-size:0.75rem;display:flex;align-items:center;justify-content:center;gap:0.4rem;}
.cc-en-espera .ico-sm{width:14px;height:14px;}

/* ═══ VISTA TODAS ═══ */
.todas-layout{display:flex;flex-direction:column;gap:1rem;}
.todas-filters{display:flex;gap:0.875rem;flex-wrap:wrap;background:rgba(255,20,147,0.03);border:1px solid rgba(255,20,147,0.15);border-radius:14px;padding:1rem 1.25rem;}
.disp-chips{display:flex;gap:0.5rem;flex-wrap:wrap;}
.dchip{display:flex;align-items:center;gap:0.45rem;padding:0.45rem 0.875rem;background:rgba(255,20,147,0.04);border:1px solid rgba(255,20,147,0.15);border-radius:20px;color:rgba(255,255,255,0.5);font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
.dchip:hover{border-color:rgba(255,20,147,0.4);color:#FF1493;}
.dchip-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.todas-list{display:flex;flex-direction:column;gap:0.75rem;}
.todas-fecha-lbl{color:rgba(255,20,147,0.65);font-size:0.68rem;font-weight:700;text-transform:capitalize;margin-bottom:0.25rem;padding-left:0.15rem;}

/* ═══ RESPONSIVE ═══ */
@media(max-width:1100px){.cr-layout{grid-template-columns:360px 1fr;}}
@media(max-width:900px){
    .cr-layout{grid-template-columns:1fr;}
    .cal-card{position:static;}
    .bcal{padding:1rem;}
    .bcal-cell{min-height:44px;}
    .day-stats{grid-template-columns:repeat(2,1fr);}
    .filters-grid{grid-template-columns:1fr;}
    .cr-hd{flex-direction:column;align-items:flex-start;}
}
@media(max-width:640px){
    .cr-title{font-size:1.55rem;}
    .main-tabs{width:100%}
    .mtab{flex:1;justify-content:center;padding:.48rem .6rem;font-size:.75rem}
    .view-tabs{width:100%}
    .vtab{flex:1}
    .filters-grid{grid-template-columns:1fr}
    .todas-filters{padding:.8rem}
    .todas-filters .fg{width:100%}
    .day-stats{grid-template-columns:1fr 1fr;gap:0.55rem;}
    .dstat{padding:0.7rem 0.55rem;border-radius:12px;}
    .dstat-n{font-size:1.45rem;}
    .dstat-l{font-size:0.58rem;margin-top:0.2rem;}
    .cc-top{flex-direction:column;gap:0.32rem;}
    .cc-meta{align-items:flex-start;flex-direction:row;gap:0.5rem;flex-wrap:wrap}
    .cc-body{padding:0.6rem 0.65rem;gap:0.35rem;}
    .cc-name{font-size:0.9rem;}
    .cc-time,.cc-instructor,.cc-location{font-size:0.72rem;}
    .cc-sub{font-size:0.72rem;}
    .cc-cupos{font-size:0.78rem;}
    .btn-reservar,.btn-espera,.cc-confirmada,.cc-en-espera{font-size:0.74rem;padding:0.48rem 0.7rem;}
    .cc-confirmada,.cc-en-espera{padding:0.48rem;}
    .disp-chips{gap:0.3rem;}
    .dchip{font-size:0.68rem;padding:0.38rem 0.65rem;}
    .flash-modal{max-width:calc(100vw - 30px);padding:1rem 1.2rem;}
    .flash-modal{max-width:calc(100vw - 30px);padding:1rem 1.2rem;}
    .flash-ico{width:22px;height:22px;}
    .flash-text{font-size:0.84rem;}
}
@media(max-width:420px){
    .cr{gap:.6rem}
    .cr-title{font-size:1.35rem;}
    .cr-sub{font-size:.75rem}
    .bcal{padding:.7rem}
    .bcal-title{font-size:1rem}
    .bcal-cell{min-height:34px}
    .bcal-num{font-size:.72rem}
    .day-stats{grid-template-columns:1fr;gap:0.5rem;}
    .dstat{padding:0.68rem 0.5rem;}
    .dstat-n{font-size:1.4rem;}
    .dstat-l{font-size:0.56rem;margin-top:0.2rem;}
    .cc-body{padding:0.55rem 0.6rem;gap:0.32rem;}
    .cc-name{font-size:0.85rem;}
    .cc-time,.cc-instructor,.cc-location{font-size:0.7rem;}
    .cc-sub{font-size:0.7rem;}
    .cc-cupos{font-size:0.75rem;}
    .btn-reservar,.btn-espera,.cc-confirmada,.cc-en-espera{font-size:0.7rem;padding:0.45rem 0.65rem}
    .cc-confirmada,.cc-en-espera{padding:0.45rem;}
    .badge-ok,.badge-wait{font-size:0.5rem;}
    .flash-modal{padding:0.85rem 1rem;}
    .flash-close{top:0.5rem;right:0.5rem;width:26px;height:26px;font-size:0.9rem;}
    .flash-modal{padding:0.85rem 1rem;}
    .flash-close{top:0.5rem;right:0.5rem;width:26px;height:26px;font-size:0.9rem;}
}

/* ...existing code... */
            `}</style>
        </ClienteLayout>
    );
}

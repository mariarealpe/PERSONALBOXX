import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

const icons = {
    dashboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
    ),
    card: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    heart: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    ),
};

export default function ClienteLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { url } = usePage();

    const isActive = (path) => url.startsWith(path);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: icons.dashboard, active: isActive('/dashboard') && !isActive('/admin') && !isActive('/instructor') && !isActive('/cliente') },
        { href: '/cliente/clases', label: 'Clases Disponibles', icon: icons.calendar, active: isActive('/cliente/clases') },
        { href: '/cliente/reservas', label: 'Mis Reservas', icon: icons.check, active: isActive('/cliente/reservas') },
        { href: '/cliente/historial', label: 'Mi Historial', icon: icons.chart, active: isActive('/cliente/historial') },
        { href: '/cliente/mi-plan', label: 'Mi Plan', icon: icons.card, active: isActive('/cliente/mi-plan') },
    ];

    const AvatarContent = () => {
        if (user.foto_url) {
            return (
                <img
                    src={user.foto_url}
                    alt={user.name}
                    style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        objectFit: 'cover', objectPosition: 'center', display: 'block',
                        border: '2px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 0 14px rgba(255,20,147,0.5)',
                    }}
                />
            );
        }
        return (
            <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'rgba(255,20,147,0.15)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FF1493', fontWeight: 900, fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 0 14px rgba(255,20,147,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dash-bg"></div>
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-shine"></div>
                <div className="sidebar-header">
                    <Link href="/cliente/clases" className="logo logo-link" onClick={() => setSidebarOpen(false)}>
                        <span className="logo-icon-wrap">{icons.calendar}</span>
                        <div>
                            <h2 className="logo-text">PERSONAL BOX</h2>
                            <p className="logo-subtitle">Portal Cliente</p>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`nav-item ${item.active ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer-line"></div>
            </aside>

            <div className="main-content">
                <header className="header" style={{ isolation: 'isolate' }}>
                    <button className="menu-button" onClick={() => { setSidebarOpen(!sidebarOpen); setDropdownOpen(false); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
                            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>

                    <Link href="/dashboard" className="header-home-link" onClick={() => setSidebarOpen(false)}>
                        <span className="header-home-icon">{icons.dashboard}</span>
                        <span className="header-home-text">Dashboard</span>
                    </Link>

                    <div style={{ position: 'relative', marginLeft: 'auto' }} ref={dropdownRef}>
                        <button onClick={() => { setDropdownOpen(!dropdownOpen); setSidebarOpen(false); }} className="avatar-btn" title={user.name}>
                            <AvatarContent />
                            <span className="ring-pulse" />
                        </button>

                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-shine"></div>
                                <div className="dropdown-user-info">
                                    <p className="dropdown-name">{user.name}</p>
                                    <p className="dropdown-email">{user.email}</p>
                                </div>
                                <div className="dropdown-divider" />
                                <Link href="/profile" onClick={() => setDropdownOpen(false)} className="dropdown-item">
                                    <span className="drop-icon">{icons.user}</span>Mi Perfil
                                </Link>
                                <div className="dropdown-divider" />
                                <Link href="/logout" method="post" as="button" onClick={() => setDropdownOpen(false)} className="dropdown-item dropdown-item-danger">
                                    <span className="drop-icon">{icons.logout}</span>Cerrar Sesión
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="content">{children}</main>
            </div>

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .dashboard-container { display: flex; min-height: 100vh; background: #030303; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; }
                .dash-bg { position: fixed; inset: 0; background: radial-gradient(ellipse 60% 50% at 0% 50%, rgba(255,20,147,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 100% 80%, rgba(255,20,147,0.07) 0%, transparent 60%); pointer-events: none; z-index: 0; animation: bgPulse 12s ease-in-out infinite alternate; }
                @keyframes bgPulse { 0% { opacity: .6; } 100% { opacity: 1; } }

                .sidebar { width: 264px; position: fixed; height: 100vh; left: 0; top: 0; z-index: 200; display: flex; flex-direction: column; transition: transform .3s cubic-bezier(.4,0,.2,1); overflow: hidden; background: rgba(255,255,255,.03); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border-right: 1px solid rgba(255,255,255,.06); box-shadow: 4px 0 40px rgba(0,0,0,.5), 0 0 60px rgba(255,20,147,.06), inset -1px 0 0 rgba(255,20,147,.08), inset 1px 0 0 rgba(255,255,255,.04); }
                .sidebar-shine { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.12) 30%, rgba(255,20,147,.5) 50%, rgba(255,255,255,.12) 70%, transparent 100%); z-index: 2; }
                .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 199; backdrop-filter: blur(3px); }

                .sidebar-header { padding: 1.6rem 1.4rem; border-bottom: 1px solid rgba(255,255,255,.05); flex-shrink: 0; background: rgba(255,20,147,.04); position: relative; z-index: 1; }
                .logo { display: flex; align-items: center; gap: .875rem; text-decoration: none; }
                .logo-icon-wrap { width: 36px; height: 36px; color: #FF1493; filter: drop-shadow(0 0 10px rgba(255,20,147,.8)); display: flex; align-items: center; justify-content: center; }
                .logo-icon-wrap svg { width: 100%; height: 100%; }
                .logo-text { font-size: 1.05rem; font-weight: 900; color: #FF1493; letter-spacing: 2px; text-shadow: 0 0 14px rgba(255,20,147,.6); }
                .logo-subtitle { font-size: .58rem; color: rgba(255,20,147,.45); margin-top: .18rem; letter-spacing: 2px; text-transform: uppercase; }

                .sidebar-nav { flex: 1; padding: .875rem .75rem; overflow-y: auto; display: flex; flex-direction: column; gap: .15rem; }
                .nav-item { display: flex; align-items: center; gap: .8rem; padding: .8rem .9rem; color: rgba(255,255,255,.38); text-decoration: none; transition: all .22s ease; border-radius: 10px; font-weight: 600; font-size: .855rem; border: 1px solid transparent; }
                .nav-item:hover { color: #FF1493; background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.06); transform: translateX(3px); }
                .nav-item.active { color: #FF1493; background: rgba(255,20,147,.1); border-color: rgba(255,20,147,.22); box-shadow: 0 0 18px rgba(255,20,147,.08), inset 0 1px 0 rgba(255,255,255,.07), inset 0 0 20px rgba(255,20,147,.06); }
                .nav-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .nav-icon svg { width: 100%; height: 100%; }
                .sidebar-footer-line { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,20,147,.25), transparent); }

                .main-content { flex: 1; margin-left: 264px; display: flex; flex-direction: column; min-width: 0; position: relative; z-index: 1; }
                .header { position: sticky; top: 0; z-index: 300; display: flex; justify-content: space-between; align-items: center; padding: .7rem 1.75rem; overflow: visible; background: rgba(255,255,255,.03); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,.06); box-shadow: 0 4px 32px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.05) inset, 0 0 40px rgba(255,20,147,.05); }
                .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,20,147,.35), transparent); }

                .menu-button { display: none; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); color: rgba(255,20,147,.85); cursor: pointer; padding: .45rem .6rem; border-radius: 9px; transition: all .2s; align-items: center; justify-content: center; }
                .menu-button:hover { background: rgba(255,20,147,.1); border-color: rgba(255,20,147,.3); color: #FF1493; }

                .avatar-btn { background: none; border: none; padding: 3px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
                .ring-pulse { position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid rgba(255,20,147,.45); animation: ringPulse 3s ease-in-out infinite; pointer-events: none; }
                @keyframes ringPulse { 0%,100% { transform: scale(1); opacity: .45; } 50% { transform: scale(1.12); opacity: .9; } }

                .dropdown-menu { position: absolute; top: calc(100% + 12px); right: 0; min-width: 220px; z-index: 9999; border-radius: 16px; overflow: hidden; animation: dropIn .2s cubic-bezier(.34,1.56,.64,1); background: rgba(10,10,12,.94); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.16); border-top: 1px solid rgba(255,255,255,.26); box-shadow: 0 24px 60px rgba(0,0,0,.82), 0 0 28px rgba(255,20,147,.16), inset 0 1px 0 rgba(255,255,255,.12); }
                .dropdown-shine { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.2) 30%, rgba(255,20,147,.6) 50%, rgba(255,255,255,.2) 70%, transparent); }
                .dropdown-user-info { padding: 1rem 1.2rem .875rem; }
                .dropdown-name { color: #fff; font-weight: 700; font-size: .88rem; margin: 0 0 .2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .dropdown-email { color: rgba(255,255,255,.3); font-size: .73rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .dropdown-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); }
                .dropdown-item { display: flex; align-items: center; gap: .7rem; padding: .8rem 1.2rem; color: rgba(255,255,255,.6); font-size: .855rem; font-weight: 600; text-decoration: none; transition: all .2s; background: none; border: none; width: 100%; text-align: left; cursor: pointer; font-family: inherit; }
                .dropdown-item:hover { background: rgba(255,255,255,.05); color: #fff; }
                .dropdown-item-danger:hover { background: rgba(239,68,68,.08) !important; color: #ef4444 !important; }
                .drop-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; opacity: .7; }
                .drop-icon svg { width: 100%; height: 100%; }
                @keyframes dropIn { from { opacity: 0; transform: translateY(-10px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

                .content { flex: 1; padding: 2rem 1.75rem; overflow-y: auto; }
                .logo-link { transition: transform .2s ease, opacity .2s ease; }
                .logo-link:hover { transform: translateY(-1px); opacity: .95; }

                .header-home-link { display: inline-flex; align-items: center; gap: .45rem; text-decoration: none; color: #FF1493; background: rgba(255,20,147,.08); border: 1px solid rgba(255,20,147,.3); border-radius: 10px; padding: .42rem .7rem; margin-left: .6rem; font-weight: 800; font-size: .8rem; box-shadow: inset 0 1px 0 rgba(255,255,255,.07); transition: all .2s ease; }
                .header-home-link:hover { background: rgba(255,20,147,.16); border-color: rgba(255,20,147,.5); color: #fff; }
                .header-home-icon { width: 14px; height: 14px; display: inline-flex; align-items: center; }
                .header-home-icon svg { width: 100%; height: 100%; }

                @media (max-width: 1024px) { .sidebar { width: 240px; } .main-content { margin-left: 240px; } }
                @media (max-width: 900px) {
                    .sidebar { transform: translateX(-100%); z-index: 400; width: 264px; }
                    .sidebar.open { transform: translateX(0); }
                    .sidebar-overlay { display: block; }
                    .main-content { margin-left: 0; }
                    .menu-button { display: flex; }
                    .content { padding: 1.25rem 1rem; }
                    .header { padding: .7rem 1rem; }
                    .header-home-link { margin-left: .45rem; padding: .4rem .62rem; }
                }
                @media (max-width: 480px) {
                    .sidebar { width: 100vw; max-width: 300px; }
                    .header { padding: .6rem .875rem; }
                    .dropdown-menu { min-width: 200px; right: -.25rem; }
                    .content { padding: 1rem .75rem; }
                    .logo-text { font-size: .95rem; letter-spacing: 1.5px; }
                    .header-home-text { display: inline; font-size: .76rem; }
                    .header-home-link { padding: .42rem .58rem; gap: .38rem; }
                }
                @media (max-width: 360px) {
                    .sidebar { max-width: 280px; }
                    .content { padding: .875rem .625rem; }
                }
            `}</style>
        </div>
    );
}

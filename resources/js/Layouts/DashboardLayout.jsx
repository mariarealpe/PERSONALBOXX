import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

/* ── Iconos SVG inline (sin emojis) ─────────────────────────────── */
const icons = {
    dashboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
    ),
    tag: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
    ),
    instructor: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    clients: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
    card: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    heart: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    ),
};

export default function DashboardLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { url } = usePage();

    const isActive = (path) => url.startsWith(path);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
                background: 'rgba(255,20,147,0.15)',
                backdropFilter: 'blur(8px)',
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

            {/* Fondo neon global */}
            <div className="dash-bg"></div>

            {/* Overlay móvil */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar — glassmorphism ── */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

                {/* Brillo superior del cristal */}
                <div className="sidebar-shine"></div>

                <div className="sidebar-header">
                    <Link href="/dashboard" className="logo logo-link" onClick={() => setSidebarOpen(false)}>
                        <span className="logo-icon-wrap">{icons.heart}</span>
                        <div>
                            <h2 className="logo-text">PERSONAL BOX</h2>
                            <p className="logo-subtitle">Sistema de Gestión</p>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/dashboard"
                        className={`nav-item ${isActive('/dashboard') && !isActive('/admin') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.dashboard}</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/tipos-clase"
                        className={`nav-item ${isActive('/admin/tipos-clase') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.tag}</span>
                        <span>Tipos de Clase</span>
                    </Link>
                    <Link href="/admin/instructores"
                        className={`nav-item ${isActive('/admin/instructores') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.instructor}</span>
                        <span>Instructores</span>
                    </Link>
                    <Link href="/admin/clientes"
                        className={`nav-item ${isActive('/admin/clientes') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.clients}</span>
                        <span>Clientes</span>
                    </Link>
                    <Link href="/admin/clases"
                        className={`nav-item ${isActive('/admin/clases') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.calendar}</span>
                        <span>Clases</span>
                    </Link>
                    <Link href="/admin/asistencias"
                        className={`nav-item ${isActive('/admin/asistencias') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.check}</span>
                        <span>Asistencias</span>
                    </Link>
                    <Link href="/admin/planes"
                        className={`nav-item ${isActive('/admin/planes') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.card}</span>
                        <span>Planes</span>
                    </Link>
                    <Link href="/admin/reportes"
                        className={`nav-item ${isActive('/admin/reportes') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">{icons.chart}</span>
                        <span>Reportes</span>
                    </Link>
                </nav>

                {/* Borde neon inferior decorativo */}
                <div className="sidebar-footer-line"></div>
            </aside>

            <div className="main-content">
                {/* ── Header — glassmorphism ── */}
                <header className="header" style={{ isolation: 'isolate' }}>
                    <button className="menu-button" onClick={() => { setSidebarOpen(!sidebarOpen); setDropdownOpen(false); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>

                    <Link href="/dashboard" className="header-home-link" onClick={() => setSidebarOpen(false)}>
                        <span className="header-home-icon">{icons.heart}</span>
                        <span className="header-home-text">Dashboard</span>
                    </Link>

                    <div style={{ position: 'relative', marginLeft: 'auto' }} ref={dropdownRef}>
                        <button
                            onClick={() => { setDropdownOpen(!dropdownOpen); setSidebarOpen(false); }}
                            className="avatar-btn"
                            title={user.name}
                        >
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

                                <Link
                                    href="/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="dropdown-item"
                                >
                                    <span className="drop-icon">{icons.user}</span>
                                    Mi Perfil
                                </Link>

                                <div className="dropdown-divider" />

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setDropdownOpen(false)}
                                    className="dropdown-item dropdown-item-danger"
                                >
                                    <span className="drop-icon">{icons.logout}</span>
                                    Cerrar Sesión
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="content">
                    {children}
                </main>
            </div>

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .dashboard-container {
                    display: flex;
                    min-height: 100vh;
                    background: #030303;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    position: relative;
                }

                /* Fondo neon global */
                .dash-bg {
                    position: fixed;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 60% 50% at 0% 50%, rgba(255,20,147,0.12) 0%, transparent 60%),
                        radial-gradient(ellipse 40% 60% at 100% 80%, rgba(255,20,147,0.07) 0%, transparent 60%);
                    pointer-events: none;
                    z-index: 0;
                    animation: bgPulse 12s ease-in-out infinite alternate;
                }
                @keyframes bgPulse {
                    0%   { opacity: 0.6; }
                    100% { opacity: 1; }
                }

                /* ── Sidebar — glassmorphism ── */
                .sidebar {
                    width: 264px;
                    position: fixed;
                    height: 100vh;
                    left: 0; top: 0;
                    z-index: 200;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
                    overflow: hidden;

                    /* glass */
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);

                    box-shadow:
                        4px 0 40px rgba(0, 0, 0, 0.5),
                        0 0 60px rgba(255, 20, 147, 0.06),
                        inset -1px 0 0 rgba(255, 20, 147, 0.08),
                        inset 1px 0 0 rgba(255, 255, 255, 0.04);
                }

                /* Línea de brillo superior del cristal */
                .sidebar-shine {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255,255,255,0.12) 30%,
                        rgba(255,20,147,0.5) 50%,
                        rgba(255,255,255,0.12) 70%,
                        transparent 100%
                    );
                    z-index: 2;
                }

                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.65);
                    z-index: 199;
                    backdrop-filter: blur(3px);
                }

                .sidebar-header {
                    padding: 1.6rem 1.4rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    flex-shrink: 0;
                    background: rgba(255, 20, 147, 0.04);
                    position: relative;
                    z-index: 1;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                }

                .logo-icon-wrap {
                    width: 36px;
                    height: 36px;
                    flex-shrink: 0;
                    color: #FF1493;
                    filter: drop-shadow(0 0 10px rgba(255,20,147,0.8));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .logo-icon-wrap svg { width: 100%; height: 100%; }

                .logo-text {
                    font-size: 1.05rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    letter-spacing: 2px;
                    text-shadow: 0 0 14px rgba(255,20,147,0.6);
                }

                .logo-subtitle {
                    font-size: 0.58rem;
                    color: rgba(255,20,147,0.45);
                    margin: 0.18rem 0 0;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 0.875rem 0.75rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                    position: relative;
                    z-index: 1;
                }

                .sidebar-nav::-webkit-scrollbar { width: 3px; }
                .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
                .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,20,147,0.3); border-radius: 2px; }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem 0.9rem;
                    color: rgba(255,255,255,0.38);
                    text-decoration: none;
                    transition: all 0.22s ease;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.855rem;
                    border: 1px solid transparent;
                    letter-spacing: 0.2px;
                }

                .nav-item:hover {
                    color: #FF1493;
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.06);
                    transform: translateX(3px);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
                }

                .nav-item.active {
                    color: #FF1493;
                    background: rgba(255, 20, 147, 0.1);
                    border-color: rgba(255, 20, 147, 0.22);
                    box-shadow:
                        0 0 18px rgba(255,20,147,0.08),
                        inset 0 1px 0 rgba(255,255,255,0.07),
                        inset 0 0 20px rgba(255,20,147,0.06);
                }

                .nav-icon {
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .nav-icon svg { width: 100%; height: 100%; }

                .sidebar-footer-line {
                    height: 1px;
                    margin: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,20,147,0.25), transparent);
                    flex-shrink: 0;
                }

                /* ── Main area ── */
                .main-content {
                    flex: 1;
                    margin-left: 264px;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    position: relative;
                    z-index: 1;
                }

                /* ── Header — glassmorphism ── */
                .header {
                    position: sticky;
                    top: 0;
                    z-index: 300;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.7rem 1.75rem;
                    overflow: visible;

                    /* glass */
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

                    box-shadow:
                        0 4px 32px rgba(0, 0, 0, 0.4),
                        0 1px 0 rgba(255, 255, 255, 0.05) inset,
                        0 0 40px rgba(255, 20, 147, 0.05);
                }

                /* Línea neon inferior del header */
                .header::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,20,147,0.35), transparent);
                    pointer-events: none;
                }

                .menu-button {
                    display: none;
                    background: rgba(255,255,255,0.04);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,20,147,0.85);
                    cursor: pointer;
                    padding: 0.45rem 0.6rem;
                    border-radius: 9px;
                    transition: all 0.2s;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
                }
                .menu-button:hover {
                    background: rgba(255,20,147,0.1);
                    border-color: rgba(255,20,147,0.3);
                    color: #FF1493;
                }

                /* Avatar */
                .avatar-btn {
                    background: none;
                    border: none;
                    padding: 3px;
                    cursor: pointer;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .ring-pulse {
                    position: absolute;
                    inset: -3px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,20,147,0.45);
                    animation: ringPulse 3s ease-in-out infinite;
                    pointer-events: none;
                }

                @keyframes ringPulse {
                    0%, 100% { transform: scale(1);    opacity: 0.45; }
                    50%       { transform: scale(1.12); opacity: 0.9; }
                }

                /* ── Dropdown — glassmorphism ── */
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    min-width: 220px;
                    z-index: 9999;
                    border-radius: 16px;
                    overflow: hidden;
                    animation: dropIn 0.2s cubic-bezier(.34,1.56,.64,1);

                    /* Más sólido para mejorar legibilidad */
                    background: rgba(10, 10, 12, 0.94);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.16);
                    border-top: 1px solid rgba(255, 255, 255, 0.26);

                    box-shadow:
                        0 24px 60px rgba(0, 0, 0, 0.82),
                        0 0 28px rgba(255, 20, 147, 0.16),
                        inset 0 1px 0 rgba(255, 255, 255, 0.12);
                }

                /* Brillo superior del dropdown */
                .dropdown-shine {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255,255,255,0.2) 30%,
                        rgba(255,20,147,0.6) 50%,
                        rgba(255,255,255,0.2) 70%,
                        transparent
                    );
                    pointer-events: none;
                    z-index: 1;
                }

                .dropdown-user-info {
                    padding: 1rem 1.2rem 0.875rem;
                }

                .dropdown-name {
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.88rem;
                    margin: 0 0 0.2rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .dropdown-email {
                    color: rgba(255,255,255,0.3);
                    font-size: 0.73rem;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .dropdown-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    padding: 0.8rem 1.2rem;
                    color: rgba(255,255,255,0.6);
                    font-size: 0.855rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                    background: none;
                    border: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    font-family: inherit;
                }
                .dropdown-item:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }

                .dropdown-item-danger:hover {
                    background: rgba(239,68,68,0.08) !important;
                    color: #ef4444 !important;
                }

                .drop-icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                }
                .drop-icon svg { width: 100%; height: 100%; }

                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── Contenido ── */
                .content {
                    flex: 1;
                    padding: 2rem 1.75rem;
                    overflow-y: auto;
                }

                /* ── Responsive — tablet ── */
                @media (max-width: 1024px) {
                    .sidebar  { width: 240px; }
                    .main-content { margin-left: 240px; }
                }

                @media (max-width: 900px) {
                    .sidebar { transform: translateX(-100%); z-index: 400; width: 264px; }
                    .sidebar.open { transform: translateX(0); }
                    .sidebar-overlay { display: block; }
                    .main-content { margin-left: 0; }
                    .menu-button { display: flex; }
                    .content { padding: 1.25rem 1rem; }
                    .header { padding: 0.7rem 1rem; }
                    .header-home-link { margin-left: .45rem; padding: .4rem .62rem; }
                }

                /* ── Responsive — móvil ── */
                @media (max-width: 480px) {
                    .sidebar { width: 100vw; max-width: 300px; }
                    .header { padding: 0.6rem 0.875rem; }
                    .dropdown-menu { min-width: 200px; right: -0.25rem; }
                    .content { padding: 1rem 0.75rem; }
                    .logo-text { font-size: 0.95rem; letter-spacing: 1.5px; }

                    /* mostrar también el texto en móvil */
                    .header-home-text { display: inline; font-size: .76rem; }
                    .header-home-link { padding: .42rem .58rem; gap: .38rem; }
                }

                @media (max-width: 360px) {
                    .sidebar { max-width: 280px; }
                    .content { padding: 0.875rem 0.625rem; }
                }

                .logo-link {
                    text-decoration: none;
                    transition: transform .2s ease, opacity .2s ease;
                }
                .logo-link:hover { transform: translateY(-1px); opacity: .95; }

                .header-home-link {
                    display: inline-flex;
                    align-items: center;
                    gap: .45rem;
                    text-decoration: none;
                    color: #FF1493;
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.3);
                    border-radius: 10px;
                    padding: .42rem .7rem;
                    margin-left: .6rem;
                    font-weight: 800;
                    font-size: .8rem;
                    letter-spacing: .2px;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
                    transition: all .2s ease;
                }
                .header-home-link:hover {
                    background: rgba(255,20,147,0.16);
                    border-color: rgba(255,20,147,0.5);
                    color: #fff;
                }
                .header-home-icon {
                    width: 14px;
                    height: 14px;
                    display: inline-flex;
                    align-items: center;
                }
                .header-home-icon svg { width: 100%; height: 100%; }
                .header-home-text { line-height: 1; }
            `}</style>
        </div>
    );
}

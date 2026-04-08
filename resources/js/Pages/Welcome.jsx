import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title="Bienvenido - Personal Box" />

            <div className="welcome-container">
                {/* Fondo animado */}
                <div className="neon-background"></div>
                <div className="grid-overlay"></div>

                {/* Partículas decorativas */}
                <div className="particles">
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                    <div className="particle p4"></div>
                    <div className="particle p5"></div>
                    <div className="particle p6"></div>
                </div>

                {/* Navbar top */}
                <nav className="top-nav">
                    <div className="nav-brand">
                        <svg className="nav-logo" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                  stroke="currentColor" strokeWidth="2" fill="currentColor" />
                        </svg>
                        <span className="nav-brand-name">PERSONAL BOX</span>
                    </div>
                    <div className="nav-actions">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="btn-nav-primary">
                                Ir al Dashboard →
                            </Link>
                        ) : (
                            <Link href={route('login')} className="btn-nav-primary">
                                Iniciar Sesión →
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero principal */}
                <main className="hero">
                    {/* Logo central animado */}
                    <div className="hero-logo-container">
                        <div className="logo-ring ring-outer"></div>
                        <div className="logo-ring ring-middle"></div>
                        <div className="logo-ring ring-inner"></div>
                        <div className="logo-icon-wrap">
                            <svg className="hero-logo-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                      stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {/* Título principal */}
                    <div className="hero-text">
                        <p className="hero-eyebrow">Armenia · Quindío · Colombia</p>
                        <h1 className="hero-title">
                            <span className="title-line">PERSONAL</span>
                            <span className="title-line title-accent">BOX</span>
                        </h1>
                        <p className="hero-subtitle">
                            ENTRENAMIENTO FUNCIONAL &nbsp;•&nbsp; CROSSFIT &nbsp;•&nbsp; BOXEO &nbsp;•&nbsp; ALTO RENDIMIENTO
                        </p>
                        <div className="hero-badges">
                            <span className="badge">Clases para todos los niveles</span>
                            <span className="badge">Entrenadores certificados</span>
                            <span className="badge">Ambiente motivador</span>
                        </div>
                    </div>

                    {/* CTAs */}
                    {/* ...se elimina el botón grande central... */}

                    {/* Stats rápidas */}
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-icon">🏋️</span>
                            <span className="stat-label">Clases</span>
                            <span className="stat-sub">Grupales & Personalizadas</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-icon">👥</span>
                            <span className="stat-label">Clientes</span>
                            <span className="stat-sub">Gestión & Seguimiento</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-icon">💳</span>
                            <span className="stat-label">Planes</span>
                            <span className="stat-sub">Membresías & Control</span>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="welcome-footer">
                    <p className="footer-location">📍 Armenia, Quindío</p>
                    <p className="footer-copy">© {currentYear} Personal Box · Todos los derechos reservados</p>
                </footer>
            </div>

            <style jsx>{`
                *, *::before, *::after {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .welcome-container {
                    min-height: 100vh;
                    background: #000;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Figtree', sans-serif;
                }

                /* ── Fondos animados ── */
                .neon-background {
                    position: fixed;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,20,147,0.18) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 80% at 80% 70%, rgba(255,20,147,0.10) 0%, transparent 60%),
                        radial-gradient(ellipse 40% 40% at 50% 10%, rgba(255,20,147,0.08) 0%, transparent 60%);
                    animation: bgPulse 10s ease-in-out infinite alternate;
                    pointer-events: none;
                    z-index: 0;
                }

                @keyframes bgPulse {
                    0%   { opacity: 0.6; }
                    100% { opacity: 1; }
                }

                .grid-overlay {
                    position: fixed;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,20,147,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,20,147,0.04) 1px, transparent 1px);
                    background-size: 60px 60px;
                    pointer-events: none;
                    z-index: 0;
                }

                /* ── Partículas ── */
                .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #FF1493;
                    animation: floatUp 8s ease-in-out infinite;
                    box-shadow: 0 0 8px #FF1493, 0 0 16px #FF1493;
                }
                .p1 { left: 10%; animation-delay: 0s;   animation-duration: 9s; }
                .p2 { left: 25%; animation-delay: 1.5s; animation-duration: 7s; }
                .p3 { left: 45%; animation-delay: 3s;   animation-duration: 11s; }
                .p4 { left: 65%; animation-delay: 0.8s; animation-duration: 8s; }
                .p5 { left: 80%; animation-delay: 2.2s; animation-duration: 10s; }
                .p6 { left: 92%; animation-delay: 4s;   animation-duration: 6s; }

                @keyframes floatUp {
                    0%   { transform: translateY(110vh) scale(1); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
                }

                /* ── Navbar ── */
                .top-nav {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 3rem;
                    border-bottom: 1px solid rgba(255,20,147,0.2);
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(10px);
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .nav-logo {
                    width: 32px;
                    height: 32px;
                    color: #FF1493;
                    filter: drop-shadow(0 0 8px #FF1493);
                }

                .nav-brand-name {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #FF1493;
                    letter-spacing: 3px;
                    text-shadow: 0 0 10px rgba(255,20,147,0.5);
                }

                .btn-nav-primary {
                    background: rgba(255,20,147,0.1);
                    border: 1.5px solid #FF1493;
                    color: #FF1493;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    text-decoration: none;
                    transition: all 0.3s;
                    letter-spacing: 0.5px;
                }

                .btn-nav-primary:hover {
                    background: #FF1493;
                    color: #000;
                    box-shadow: 0 0 20px rgba(255,20,147,0.5);
                }

                /* ── Hero ── */
                .hero {
                    position: relative;
                    z-index: 5;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    text-align: center;
                    gap: 2.5rem;
                }

                /* ── Logo animado ── */
                .hero-logo-container {
                    position: relative;
                    width: 160px;
                    height: 160px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .logo-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(255,20,147,0.4);
                    animation: ringPulse 3s ease-in-out infinite;
                }

                .ring-outer {
                    width: 160px;
                    height: 160px;
                    animation-delay: 0s;
                    border-color: rgba(255,20,147,0.2);
                }

                .ring-middle {
                    width: 120px;
                    height: 120px;
                    animation-delay: 0.5s;
                    border-color: rgba(255,20,147,0.35);
                }

                .ring-inner {
                    width: 85px;
                    height: 85px;
                    animation-delay: 1s;
                    border-color: rgba(255,20,147,0.5);
                    border-width: 2px;
                }

                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50%       { transform: scale(1.08); opacity: 1; }
                }

                .logo-icon-wrap {
                    position: relative;
                    z-index: 2;
                    width: 64px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .hero-logo-icon {
                    width: 64px;
                    height: 64px;
                    color: #FF1493;
                    filter: drop-shadow(0 0 20px #FF1493) drop-shadow(0 0 40px rgba(255,20,147,0.6));
                    animation: heartbeat 2.5s ease-in-out infinite;
                }

                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    15%, 45% { transform: scale(1.15); }
                    30%, 60% { transform: scale(1); }
                }

                /* ── Texto hero ── */
                .hero-text {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .hero-eyebrow {
                    font-size: 0.7rem;
                    color: #666;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .hero-title {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                    line-height: 0.9;
                }

                .title-line {
                    font-size: clamp(4rem, 12vw, 8rem);
                    font-weight: 900;
                    letter-spacing: 12px;
                    color: #fff;
                    text-shadow:
                        0 0 30px rgba(255,255,255,0.1);
                    display: block;
                }

                .title-accent {
                    color: #FF1493;
                    text-shadow:
                        0 0 20px #FF1493,
                        0 0 40px #FF1493,
                        0 0 80px rgba(255,20,147,0.5);
                    animation: neonFlicker 4s ease-in-out infinite alternate;
                }

                @keyframes neonFlicker {
                    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
                        text-shadow:
                            0 0 20px #FF1493,
                            0 0 40px #FF1493,
                            0 0 80px rgba(255,20,147,0.5);
                    }
                    20%, 24%, 55% {
                        text-shadow: none;
                        opacity: 0.9;
                    }
                }

                .hero-subtitle {
                    font-size: 0.75rem;
                    color: #999;
                    letter-spacing: 3px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-top: 0.5rem;
                }

                .hero-badges {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-top: 0.5rem;
                }

                .badge {
                    padding: 0.35rem 0.75rem;
                    border-radius: 999px;
                    border: 1px solid rgba(255,20,147,0.35);
                    color: #FF1493;
                    font-size: 0.7rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    background: rgba(255,20,147,0.08);
                    box-shadow: 0 0 12px rgba(255,20,147,0.15);
                }

                /* ── Botones CTA ── */
                .hero-ctas {
                    display: flex;
                    justify-content: center;
                }

                .btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.625rem;
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    color: #000;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    font-weight: 900;
                    font-size: 1rem;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 0 30px rgba(255,20,147,0.5), 0 4px 15px rgba(255,20,147,0.3);
                    letter-spacing: 0.5px;
                    position: relative;
                    overflow: hidden;
                }

                .btn-primary::before {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 0; height: 0;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    transform: translate(-50%,-50%);
                    transition: width 0.6s, height 0.6s;
                }

                .btn-primary:hover::before {
                    width: 300px;
                    height: 300px;
                }

                .btn-primary:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 0 50px rgba(255,20,147,0.7), 0 8px 25px rgba(255,20,147,0.4);
                }

                .btn-icon { font-size: 1.1rem; }
                .btn-arrow { font-size: 1.1rem; transition: transform 0.3s; }
                .btn-primary:hover .btn-arrow { transform: translateX(4px); }

                /* ── Stats ── */
                .hero-stats {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    background: rgba(10,10,10,0.8);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 16px;
                    padding: 1.5rem 2rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 40px rgba(255,20,147,0.08);
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 0;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0 2rem;
                    text-align: center;
                }

                .stat-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }

                .stat-label {
                    color: #FF1493;
                    font-weight: 800;
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .stat-sub {
                    color: #555;
                    font-size: 0.7rem;
                    letter-spacing: 0.5px;
                }

                .stat-divider {
                    width: 1px;
                    height: 48px;
                    background: rgba(255,20,147,0.2);
                    flex-shrink: 0;
                }

                /* ── Footer ── */
                .welcome-footer {
                    position: relative;
                    z-index: 5;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 3rem;
                    border-top: 1px solid rgba(255,20,147,0.15);
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(10px);
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .footer-location {
                    color: #FF1493;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-shadow: 0 0 8px rgba(255,20,147,0.4);
                }

                .footer-copy {
                    color: #444;
                    font-size: 0.75rem;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .top-nav { padding: 1rem 1.5rem; }
                    .nav-brand-name { font-size: 0.875rem; letter-spacing: 2px; }
                    .hero { gap: 1.75rem; padding: 2rem 1.25rem; }
                    .hero-logo-container { width: 120px; height: 120px; }
                    .ring-outer  { width: 120px; height: 120px; }
                    .ring-middle { width: 90px;  height: 90px; }
                    .ring-inner  { width: 65px;  height: 65px; }
                    .hero-logo-icon { width: 48px; height: 48px; }
                    .title-line { letter-spacing: 6px; }
                    .hero-subtitle { font-size: 0.65rem; letter-spacing: 1.5px; }
                    .hero-description { font-size: 0.9rem; }
                    .hero-stats { padding: 1rem 1.25rem; gap: 0.5rem; }
                    .stat-item { padding: 0 1rem; }
                    .stat-divider { height: 36px; }
                    .welcome-footer { padding: 1rem 1.5rem; flex-direction: column; text-align: center; }
                }

                @media (max-width: 480px) {
                    .stat-divider { display: none; }
                    .hero-stats { gap: 1rem; }
                    .stat-item { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,20,147,0.1); width: 100%; }
                    .stat-item:last-child { border-bottom: none; }
                }
            `}</style>
        </>
    );
}

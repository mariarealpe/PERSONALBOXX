import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function InstructorDashboard({ user, stats }) {
    return (
        <DashboardLayout user={user}>
            <Head title="Dashboard Instructor" />

            <div className="dashboard-instructor">
                <div className="welcome-section">
                    <h1 className="page-title">¡Hola, {user.name}!</h1>
                    <p className="page-subtitle">Tus Clases y Alumnos</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <p className="stat-label">Clases Hoy</p>
                            <h3 className="stat-value">{stats.clases_hoy}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <p className="stat-label">Clases esta Semana</p>
                            <h3 className="stat-value">{stats.clases_semana}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <p className="stat-label">Total Alumnos</p>
                            <h3 className="stat-value">{stats.total_alumnos}</h3>
                        </div>
                    </div>
                </div>

                {/* Today's Classes */}
                <div className="section">
                    <h2 className="section-title">Mis Clases de Hoy</h2>
                    <div className="classes-container">
                        <div className="empty-state-card">
                            <p className="empty-text">No tienes clases programadas para hoy.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="section">
                    <h2 className="section-title">Acciones Rápidas</h2>
                    <div className="actions-grid">
                        <button className="action-button">
                            <span className="action-icon">✓</span>
                            <span>Registrar Asistencia</span>
                        </button>
                        <button className="action-button">
                            <span className="action-icon">📋</span>
                            <span>Ver Mis Clases</span>
                        </button>
                        <button className="action-button">
                            <span className="action-icon">👥</span>
                            <span>Ver Alumnos</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-instructor {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .welcome-section {
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 0.5rem 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                }

                .page-subtitle {
                    color: #999;
                    font-size: 1rem;
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);
                }

                .stat-card:hover {
                    border-color: #FF1493;
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.3);
                    transform: translateY(-5px);
                }

                .stat-icon {
                    font-size: 3rem;
                    filter: drop-shadow(0 0 10px rgba(255, 20, 147, 0.5));
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    color: #999;
                    font-size: 0.875rem;
                    margin: 0 0 0.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .stat-value {
                    color: #FF1493;
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                }

                .section {
                    margin-bottom: 3rem;
                }

                .section-title {
                    color: #FF1493;
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin: 0 0 1.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .classes-container {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);
                }

                .empty-state-card {
                    padding: 2rem;
                }

                .empty-text {
                    color: #666;
                    text-align: center;
                    margin: 0;
                }

                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .action-button {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid #FF1493;
                    color: #FF1493;
                    padding: 1.5rem 1rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .action-button:hover {
                    background: #FF1493;
                    color: #000;
                    box-shadow: 0 0 25px rgba(255, 20, 147, 0.5);
                    transform: translateY(-3px);
                }

                .action-icon {
                    font-size: 2rem;
                }

                @media (max-width: 768px) {
                    .page-title {
                        font-size: 2rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .actions-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}

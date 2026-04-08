import DashboardLayout from '@/Layouts/DashboardLayout';
import InstructorLayout from '@/Layouts/InstructorLayout';
import ClienteLayout from '@/Layouts/ClienteLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function getLayout(user, children) {
    const roles = user.roles?.map(r => r.name) ?? [];

    if (roles.includes('instructor')) {
        return <InstructorLayout user={user}>{children}</InstructorLayout>;
    }
    if (roles.includes('cliente')) {
        return <ClienteLayout user={user}>{children}</ClienteLayout>;
    }
    // administrador o cualquier otro rol
    return <DashboardLayout user={user}>{children}</DashboardLayout>;
}

export default function Edit({ auth, mustVerifyEmail, status, emailChange }) {
    const content = (
        <>
            <Head title="Mi Perfil" />

            <div className="profile-container">
                <div className="profile-header">
                    <div className="header-avatar-wrap">
                        {auth.user.foto_url ? (
                            <img src={auth.user.foto_url} alt={auth.user.name} className="avatar-img" />
                        ) : (
                            <span className="avatar-letter">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className="avatar-ring"></div>
                    </div>
                    <div className="header-info">
                        <h1 className="profile-title">MI PERFIL</h1>
                        <p className="profile-name">{auth.user.name}</p>
                        <p className="profile-email">{auth.user.email}</p>
                    </div>
                </div>

                <div className="sections-grid">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        user={auth.user}
                        emailChange={emailChange}
                    />
                    <UpdatePasswordForm />
                </div>
            </div>

            <style>{`
                .profile-container {
                    max-width: 860px;
                    margin: 0 auto;
                }
                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 1.75rem;
                    margin-bottom: 2.5rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid rgba(255,20,147,0.2);
                }
                .header-avatar-wrap {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    flex-shrink: 0;
                }
                .avatar-img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    position: relative;
                    z-index: 1;
                    border: 2px solid #FF1493;
                }
                .avatar-letter {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.25rem;
                    font-weight: 900;
                    color: #000;
                    position: relative;
                    z-index: 1;
                }
                .avatar-ring {
                    position: absolute;
                    inset: -5px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,20,147,0.5);
                    animation: ringPulse 3s ease-in-out infinite;
                }
                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.08); opacity: 1; }
                }
                .header-info { display: flex; flex-direction: column; gap: 0.2rem; }
                .profile-title {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    letter-spacing: 4px;
                    text-shadow: 0 0 10px rgba(255,20,147,0.5);
                }
                .profile-name { color: #fff; font-size: 1rem; font-weight: 600; margin: 0; }
                .profile-email { color: #555; font-size: 0.825rem; margin: 0; }
                .sections-grid { display: flex; flex-direction: column; gap: 1.5rem; }

                @media (max-width: 640px) {
                    .profile-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        padding-bottom: 1.25rem;
                    }
                    .header-avatar-wrap,
                    .avatar-img,
                    .avatar-letter { width: 68px; height: 68px; }
                    .avatar-letter { font-size: 1.9rem; }
                    .profile-title { font-size: 1.35rem; letter-spacing: 2px; }
                    .profile-name { font-size: .95rem; }
                    .profile-email { font-size: .78rem; }
                    .sections-grid { gap: 1rem; }
                }
            `}</style>
        </>
    );

    return getLayout(auth.user, content);
}

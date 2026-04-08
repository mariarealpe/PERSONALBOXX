import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import ConfirmDialog from '../../../Components/ConfirmDialog';

export default function InstructoresIndex({ auth, instructores, tiposClase, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [previewFoto, setPreviewFoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, type: 'error', message: '' });
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: null,
    });

    const showToast = (message, type = 'error') => {
        setToast({ open: true, type, message });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 4000);
    };

    const { data, setData, errors, setError, clearErrors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        especialidad: '',
        tarifa_por_clase: '',
        tarifa_por_asistente: '',
        biografia: '',
        foto: null,
        especialidades_ids: [],
        activo: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setPreviewFoto(null);
        setEditingInstructor(null);
        setShowModal(true);
    };

    const openEditModal = (instructor) => {
        setData({
            name: instructor.user.name,
            email: instructor.user.email,
            password: '',
            especialidad: instructor.especialidad || '',
            tarifa_por_clase: instructor.tarifa_por_clase || '',
            tarifa_por_asistente: instructor.tarifa_por_asistente || '',
            biografia: instructor.biografia || '',
            foto: null,
            especialidades_ids: instructor.especialidades.map(e => e.id),
            activo: instructor.activo,
        });
        clearErrors();
        setPreviewFoto(instructor.foto_url);
        setEditingInstructor(instructor);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingInstructor(null);
        setPreviewFoto(null);
        setIsSubmitting(false);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        if (data.password) formData.append('password', data.password);
        if (data.especialidad) formData.append('especialidad', data.especialidad);

        // Enviar siempre tarifas si el campo existe (incluye "0")
        if (data.tarifa_por_clase !== '' && data.tarifa_por_clase !== null && data.tarifa_por_clase !== undefined) {
            formData.append('tarifa_por_clase', data.tarifa_por_clase);
        }
        if (data.tarifa_por_asistente !== '' && data.tarifa_por_asistente !== null && data.tarifa_por_asistente !== undefined) {
            formData.append('tarifa_por_asistente', data.tarifa_por_asistente);
        }

        if (data.biografia) formData.append('biografia', data.biografia);
        if (data.foto) formData.append('foto', data.foto);
        formData.append('activo', data.activo ? '1' : '0');
        data.especialidades_ids.forEach((id, index) => {
            formData.append(`especialidades_ids[${index}]`, id);
        });

        setIsSubmitting(true);

        if (editingInstructor) {
            formData.append('_method', 'PUT');
            router.post(route('admin.instructores.update', editingInstructor.id), formData, {
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: (errs) => {
                    setIsSubmitting(false);
                    Object.keys(errs).forEach(k => setError(k, errs[k]));
                },
            });
        } else {
            router.post(route('admin.instructores.store'), formData, {
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: (errs) => {
                    setIsSubmitting(false);
                    Object.keys(errs).forEach(k => setError(k, errs[k]));
                },
            });
        }
    };

    const openConfirm = (opts) => setConfirmState({ open: true, ...opts });
    const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

    const getFirstErrorMessage = (errs, fallback = 'No se pudo eliminar el instructor.') => {
        if (!errs) return fallback;
        const values = Object.values(errs).flat();
        return values.find(Boolean) || fallback;
    };

    const handleDelete = (instructor) => {
        openConfirm({
            title: 'Eliminar instructor',
            message: `¿Estás segura de eliminar al instructor "${instructor.user.name}"?`,
            confirmText: 'Eliminar',
            onConfirm: () =>
                new Promise((resolve) => {
                    router.delete(route('admin.instructores.destroy', instructor.id), {
                        preserveScroll: true,
                        onSuccess: () => {
                            closeConfirm();
                            showToast('Instructor eliminado correctamente.', 'success');
                            resolve();
                        },
                        onError: (errs) => {
                            const msg = getFirstErrorMessage(
                                errs,
                                'No se pudo eliminar. Verifica si tiene clases o registros asociados.'
                            );
                            setConfirmState((s) => ({
                                ...s,
                                title: 'No se pudo eliminar',
                                message: msg,
                                confirmText: 'Entendido',
                            }));
                            showToast(msg, 'error');
                            resolve();
                        },
                    });
                }),
        });
    };

    const handleToggle = (instructor) => {
        router.patch(route('admin.instructores.toggle', instructor.id));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.instructores.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('foto', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewFoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleEspecialidad = (tipoId) => {
        const current = [...data.especialidades_ids];
        const index = current.indexOf(tipoId);
        if (index > -1) current.splice(index, 1);
        else current.push(tipoId);
        setData('especialidades_ids', current);
    };

    const formatCOP = (valor) => {
        const num = parseFloat(valor);
        if (!num || num === 0) return <span className="tarifa-empty">No definida</span>;
        return <span className="tarifa-value">${new Intl.NumberFormat('es-CO').format(num)} COP</span>;
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Instructores" />

            <div className="page-container">
                {toast.open && (
                    <div className={`toast ${toast.type}`} role="status" aria-live="polite">
                        <div className="toast-title">
                            {toast.type === 'error' ? 'No se pudo completar la acción' : 'Acción completada'}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                )}

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">INSTRUCTORES</h1>
                        <p className="page-subtitle">Gestión del equipo y perfiles de instructores</p>
                    </div>
                    <button type="button" onClick={openCreateModal} className="btn-primary">
                        Nuevo Instructor
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-wrapper">
                        <span className="search-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, correo o especialidad"
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-ghost">
                        Buscar
                    </button>
                </form>

                {/* Table glass card */}
                <div className="glass-card">
                    <div className="table-scroll">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Instructor</th>
                                <th>Especialidades</th>
                                <th className="text-center">Tarifa por Clase</th>
                                <th className="text-center">Tarifa por Asistente</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {instructores.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <span>Sin registros</span>
                                        <p>No hay instructores registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                instructores.data.map((instructor) => (
                                    <tr key={instructor.id}>
                                        <td>
                                            <div className="instructor-cell">
                                                <div className="instructor-avatar">
                                                    {instructor.foto_url ? (
                                                        <img src={instructor.foto_url} alt={instructor.user.name} />
                                                    ) : (
                                                        <span className="avatar-initial">
                                                            {instructor.user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="instructor-name">{instructor.user.name}</p>
                                                    <p className="instructor-email">{instructor.user.email}</p>
                                                    {instructor.especialidad && (
                                                        <p className="instructor-spec">{instructor.especialidad}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="badges-wrap">
                                                {instructor.especialidades.length > 0 ? (
                                                    instructor.especialidades.map((tipo) => (
                                                        <span
                                                            key={tipo.id}
                                                            className="esp-badge"
                                                            style={{ backgroundColor: tipo.color }}
                                                        >
                                                            {tipo.nombre}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">Sin especialidades</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            {formatCOP(instructor.tarifa_por_clase)}
                                        </td>
                                        <td className="text-center">
                                            {formatCOP(instructor.tarifa_por_asistente)}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(instructor)}
                                                className={`status-badge ${instructor.activo ? 'status-active' : 'status-inactive'}`}
                                            >
                                                {instructor.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(instructor)}
                                                    className="btn-action btn-blue"
                                                    title="Editar"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(instructor)}
                                                    className="btn-action btn-red"
                                                    title="Eliminar"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {instructores.links.length > 3 && (
                    <div className="pagination">
                        {instructores.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                className={`page-btn ${link.active ? 'active' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-glass" onClick={(e) => e.stopPropagation()}>

                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
                                </h2>
                                <button type="button" onClick={closeModal} className="btn-close">×</button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form-wrapper">

                                <div className="modal-body">

                                    {/* Foto */}
                                    <div className="form-group">
                                        <label className="form-label">Foto de perfil</label>
                                        <div className="foto-row">
                                            <div className="foto-preview">
                                                {previewFoto ? (
                                                    <img src={previewFoto} alt="Preview" />
                                                ) : (
                                                    <div className="foto-placeholder">
                                                        <span>Sin foto</span>
                                                        <p>Subir imagen</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" accept="image/*" onChange={handleFotoChange} id="foto-input" className="hidden-input" />
                                            <label htmlFor="foto-input" className="btn-upload">
                                                Seleccionar imagen
                                            </label>
                                        </div>
                                        {errors.foto && <p className="form-error">{errors.foto}</p>}
                                    </div>

                                    {/* Name / Email */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Nombre completo *</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="form-input"
                                                placeholder="Ej: Carlos Martínez"
                                                required
                                            />
                                            {errors.name && <p className="form-error">{errors.name}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Correo electrónico *</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="form-input"
                                                placeholder="instructor@personalbox.com"
                                                required
                                            />
                                            {errors.email && <p className="form-error">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            Contraseña {!editingInstructor && '*'}
                                            {editingInstructor && <span className="label-hint">(dejar en blanco para mantener la actual)</span>}
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="form-input"
                                            placeholder="Mínimo 8 caracteres"
                                            required={!editingInstructor}
                                        />
                                        {errors.password && <p className="form-error">{errors.password}</p>}
                                    </div>

                                    {/* Especialidad principal */}
                                    <div className="form-group">
                                        <label className="form-label">Especialidad principal</label>
                                        <input
                                            type="text"
                                            value={data.especialidad}
                                            onChange={(e) => setData('especialidad', e.target.value)}
                                            className="form-input"
                                            placeholder="Ej: Crossfit y Musculación"
                                        />
                                        {errors.especialidad && <p className="form-error">{errors.especialidad}</p>}
                                    </div>

                                    {/* Tipos de clase */}
                                    <div className="form-group">
                                        <label className="form-label">Tipos de clase que puede impartir</label>
                                        <div className="tipos-grid">
                                            {tiposClase.map((tipo) => (
                                                <label key={tipo.id} className="tipo-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.especialidades_ids.includes(tipo.id)}
                                                        onChange={() => toggleEspecialidad(tipo.id)}
                                                        className="hidden-input"
                                                    />
                                                    <span
                                                        className="tipo-badge"
                                                        style={{
                                                            backgroundColor: data.especialidades_ids.includes(tipo.id) ? tipo.color : 'rgba(255,20,147,0.07)',
                                                            borderColor: tipo.color,
                                                            opacity: data.especialidades_ids.includes(tipo.id) ? 1 : 0.6,
                                                        }}
                                                    >
                                                        {tipo.nombre}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.especialidades_ids && <p className="form-error">{errors.especialidades_ids}</p>}
                                    </div>

                                    {/* Tarifas */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Tarifa por clase</label>
                                            <div className="input-prefix-wrap">
                                                <span className="input-prefix-symbol">$</span>
                                                <input
                                                    type="number"
                                                    value={data.tarifa_por_clase}
                                                    onChange={(e) => setData('tarifa_por_clase', e.target.value)}
                                                    className="form-input form-input-prefixed"
                                                    placeholder="50000"
                                                    min="0"
                                                    step="1000"
                                                />
                                            </div>
                                            {errors.tarifa_por_clase && <p className="form-error">{errors.tarifa_por_clase}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Tarifa por asistente</label>
                                            <div className="input-prefix-wrap">
                                                <span className="input-prefix-symbol">$</span>
                                                <input
                                                    type="number"
                                                    value={data.tarifa_por_asistente}
                                                    onChange={(e) => setData('tarifa_por_asistente', e.target.value)}
                                                    className="form-input form-input-prefixed"
                                                    placeholder="5000"
                                                    min="0"
                                                    step="1000"
                                                />
                                            </div>
                                            {errors.tarifa_por_asistente && <p className="form-error">{errors.tarifa_por_asistente}</p>}
                                        </div>
                                    </div>

                                    {/* Biografía */}
                                    <div className="form-group">
                                        <label className="form-label">Biografía</label>
                                        <textarea
                                            value={data.biografia}
                                            onChange={(e) => setData('biografia', e.target.value)}
                                            className="form-textarea"
                                            rows="3"
                                            placeholder="Describe la experiencia y certificaciones del instructor..."
                                        />
                                        {errors.biografia && <p className="form-error">{errors.biografia}</p>}
                                    </div>

                                    {/* Activo */}
                                    <div className="form-group">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={data.activo}
                                                onChange={(e) => setData('activo', e.target.checked)}
                                                className="toggle-checkbox"
                                            />
                                            <span>Activo (puede impartir clases)</span>
                                        </label>
                                    </div>

                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={closeModal} className="btn-ghost">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                                        {isSubmitting ? 'Guardando...' : 'Guardar Instructor'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                )}

                {/* Confirm Dialog */}
                <ConfirmDialog
                    open={confirmState.open}
                    title={confirmState.title}
                    message={confirmState.message}
                    confirmText={confirmState.confirmText}
                    cancelText={confirmState.cancelText}
                    onConfirm={confirmState.onConfirm}
                    onClose={closeConfirm}
                    autoCloseOnConfirm={false}
                />
            </div>

            <style>{`
                * { box-sizing: border-box; }

                /* eliminado :root con --pink / --pink-soft-modal para evitar errores de resolución */

                .page-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0.5rem 0;
                    position: relative;
                }

                .page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .page-header .btn-primary {
                    margin-left: auto;
                    align-self: flex-start;
                }

                .toast {
                    position: fixed;
                    top: 1rem;
                    right: 1rem;
                    z-index: 1200;
                    min-width: 280px;
                    max-width: 420px;
                    padding: 0.85rem 1rem;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid;
                    box-shadow: 0 10px 28px rgba(0,0,0,0.35);
                    animation: toastIn .2s ease;
                }

                .toast.error {
                    background: rgba(127, 29, 29, 0.88);
                    border-color: rgba(248, 113, 113, 0.55);
                    color: #fee2e2;
                }

                .toast.success {
                    background: rgba(20, 83, 45, 0.88);
                    border-color: rgba(74, 222, 128, 0.55);
                    color: #dcfce7;
                }

                .toast-title {
                    font-weight: 800;
                    font-size: 0.8rem;
                    margin-bottom: 0.2rem;
                    text-transform: uppercase;
                    letter-spacing: .4px;
                }

                .toast-message {
                    font-size: 0.82rem;
                    line-height: 1.35;
                }

                .page-title {
                    font-size: clamp(1.6rem, 4vw, 2.2rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 0.25rem;
                    letter-spacing: 1px;
                    text-shadow: 0 0 12px rgba(255,20,147,0.45);
                }

                .page-subtitle { color: #777; margin: 0; font-size: 0.85rem; }

                .btn-primary {
                    background: rgba(255,20,147,0.18);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #FF1493;
                    text-shadow: 0 0 8px rgba(255,20,147,0.35);
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(10px);
                }
                .btn-primary:hover:not(:disabled) {
                    background: rgba(255,20,147,0.28);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255,20,147,0.35);
                    transform: translateY(-1px);
                }
                .btn-primary:disabled { opacity: .6; cursor: not-allowed; }

                .btn-ghost {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.35);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all .2s ease;
                }
                .btn-ghost:hover { background: rgba(255,20,147,0.14); }

                .search-form {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .search-wrapper {
                    flex: 1;
                    min-width: 220px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    color: rgba(255,255,255,0.45);
                    width: 16px; height: 16px;
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: rgba(0,0,0,0.45);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-bottom: 1px solid rgba(255,20,147,0.3);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.9rem;
                    outline: none;
                }

                .glass-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 0 28px rgba(255,20,147,0.08), 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07);
                }

                .table-scroll { overflow-x: auto; }

                .table { width: 100%; border-collapse: collapse; min-width: 760px; }
                .table thead { background: rgba(255,20,147,0.05); }
                .table th {
                    padding: 1rem;
                    text-align: left;
                    color: rgba(255,20,147,0.85);
                    font-weight: 900;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid rgba(255,20,147,0.18);
                    white-space: nowrap;
                }
                .table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.82);
                    font-size: 0.88rem;
                    vertical-align: middle;
                }
                .table tbody tr:hover { background: rgba(255,20,147,0.04); }

                .text-center { text-align: center !important; }
                .text-muted { color: rgba(255,255,255,0.4); font-style: italic; font-size: 0.8rem; }

                .instructor-cell { display: flex; align-items: center; gap: .875rem; }
                .instructor-avatar {
                    width: 44px; height: 44px; border-radius: 50%;
                    overflow: hidden; flex-shrink: 0;
                    border: 1px solid rgba(255,20,147,0.45);
                    background: rgba(255,20,147,0.18);
                    box-shadow: 0 0 12px rgba(255,20,147,0.18), inset 0 1px 0 rgba(255,255,255,0.08);
                    display: flex; align-items: center; justify-content: center;
                }
                .instructor-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-initial { color: #FF1493; font-size: 1rem; font-weight: 900; }

                .instructor-name { color: #fff; font-weight: 700; margin: 0 0 .2rem; font-size: .9rem; }
                .instructor-email { color: rgba(255,255,255,0.4); margin: 0 0 .2rem; font-size: .78rem; }
                .instructor-spec { color: rgba(255,20,147,0.9); margin: 0; font-size: .72rem; }

                .badges-wrap { display: flex; flex-wrap: wrap; gap: .4rem; }
                .esp-badge {
                    display: inline-block;
                    padding: .3rem .65rem;
                    border-radius: 999px;
                    color: #fff;
                    font-weight: 700;
                    font-size: .7rem;
                    text-shadow: 0 1px 2px rgba(0,0,0,.45);
                }

                .tarifa-value { color: rgba(255,20,147,0.95); font-weight: 700; font-size: .875rem; }
                .tarifa-empty { color: rgba(255,255,255,.25); font-style: italic; font-size: .78rem; }

                .status-badge {
                    padding: 0.4rem 0.875rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.72rem;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .status-active { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.35); }
                .status-inactive { background: rgba(107,114,128,0.12); color: #9ca3af; border: 1px solid rgba(107,114,128,0.35); }

                .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .btn-action {
                    padding: 0.45rem 0.7rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    cursor: pointer;
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.3);
                    color: rgba(255,20,147,0.95);
                }
                .btn-blue { border-color: rgba(255,20,147,0.3); color: rgba(255,20,147,0.95); background: rgba(255,20,147,0.08); }
                .btn-red { border-color: rgba(239,68,68,0.6); color: #ef4444; background: rgba(239,68,68,0.08); }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem !important;
                    color: #666 !important;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-top: 1.5rem;
                }

                .page-btn {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.25);
                    color: rgba(255,20,147,0.9);
                    padding: 0.5rem 0.875rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 700;
                    font-size: 0.8rem;
                }
                .page-btn:hover:not(:disabled) { background: rgba(255,20,147,0.16); }
                .page-btn.active { background: rgba(255,20,147,0.28); color: #fff; border-color: rgba(255,20,147,0.6); }
                .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

                /* Modal rosa (basado en Clientes) */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.2rem;
                    z-index: 1000;
                }

                .modal-glass {
                    width: 100%;
                    max-width: 680px;
                    height: 90vh;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border-radius: 14px;
                    background: rgba(18,10,20,0.96);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-top: 2px solid #e754a6;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(231,84,166,0.18);
                    animation: popIn 0.18s ease;
                }

                .modal-header {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .modal-title { color: #fff; font-size: 1.05rem; font-weight: 900; margin: 0; }

                .btn-close {
                    background: transparent;
                    border: none;
                    color: #999;
                    font-size: 1.1rem;
                    cursor: pointer;
                }

                .modal-form-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
                .modal-body { flex: 1; overflow-y: auto; padding: 1.25rem; min-height: 0; }

                .modal-footer {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    flex-wrap: wrap;
                }

                .form-group { margin-bottom: 1rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .form-label {
                    display: block;
                    color: #FF1493;
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .label-hint { color: #777; font-size: 0.68rem; font-weight: 400; text-transform: none; margin-left: 0.5rem; }

                .form-input, .form-textarea {
                    width: 100%;
                    padding: 0.875rem;
                    background: #000;
                    border: 2px solid rgba(255,20,147,0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    outline: none;
                }
                .form-input::placeholder, .form-textarea::placeholder { color: rgba(255,255,255,0.25); }
                .form-textarea { resize: vertical; font-family: inherit; }

                .form-error { color: #ef4444; font-size: 0.75rem; margin: 0.35rem 0 0; }

                .foto-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
                .foto-preview {
                    width: 88px; height: 88px; border-radius: 50%; overflow: hidden;
                    border: 2px solid rgba(255,20,147,0.35);
                    background: rgba(255,20,147,0.08);
                    flex-shrink: 0;
                }
                .foto-preview img { width: 100%; height: 100%; object-fit: cover; }

                .foto-placeholder {
                    width: 100%; height: 100%;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: rgba(255,255,255,0.4);
                }

                .hidden-input { display: none; }

                .btn-upload {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.35);
                    color: #FF1493;
                    padding: 0.7rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    cursor: pointer;
                }

                .tipos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                    gap: 0.6rem;
                }
                .tipo-option { cursor: pointer; }

                .tipo-badge {
                    display: block;
                    padding: 0.55rem 0.75rem;
                    border-radius: 8px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.72rem;
                    text-align: center;
                    border: 1px solid;
                    transition: all 0.2s;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                }

                .input-prefix-wrap { position: relative; display: flex; align-items: center; }
                .input-prefix-symbol {
                    position: absolute; left: 1rem;
                    color: #FF1493; font-weight: 700; pointer-events: none;
                }
                .form-input-prefixed { padding-left: 2.25rem; }

                .toggle-label {
                    display: flex; align-items: center; gap: 0.75rem;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer; font-size: 0.875rem; font-weight: 600;
                }
                .toggle-checkbox { width: 18px; height: 18px; accent-color: #FF1493; cursor: pointer; }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: stretch; }
                    .page-header .btn-primary { margin-left: 0; width: 100%; }
                    .btn-primary, .btn-ghost { width: 100%; justify-content: center; }
                    .search-form { flex-direction: column; }
                    .form-row { grid-template-columns: 1fr; }
                    .modal-footer { flex-direction: column; }
                }

                @media (max-width: 480px) {
                    .modal-glass { border-radius: 12px; }
                    .table { min-width: 680px; }
                }

                @keyframes toastIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
            `}</style>
        </DashboardLayout>
    );
}

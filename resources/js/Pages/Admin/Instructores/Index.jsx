import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function InstructoresIndex({ auth, instructores, tiposClase, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [previewFoto, setPreviewFoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (data.tarifa_por_clase) formData.append('tarifa_por_clase', data.tarifa_por_clase);
        if (data.tarifa_por_asistente) formData.append('tarifa_por_asistente', data.tarifa_por_asistente);
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

    const handleDelete = (instructor) => {
        if (confirm(`¿Estás segura de eliminar al instructor "${instructor.user.name}"?`)) {
            router.delete(route('admin.instructores.destroy', instructor.id));
        }
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

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">INSTRUCTORES</h1>
                        <p className="page-subtitle">Gestiona el equipo de instructores del box</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary">
                        <span>＋</span>
                        Nuevo Instructor
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, email o especialidad..."
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-search">
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
                                <th className="text-center">💼 Tarifa por Clase</th>
                                <th className="text-center">👥 Tarifa por Asistente</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {instructores.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <span>👨‍🏫</span>
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
                                                onClick={() => handleToggle(instructor)}
                                                className={`status-badge ${instructor.activo ? 'status-active' : 'status-inactive'}`}
                                            >
                                                {instructor.activo ? '✓ Activo' : '✗ Inactivo'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    onClick={() => openEditModal(instructor)}
                                                    className="btn-icon btn-icon-edit"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(instructor)}
                                                    className="btn-icon btn-icon-delete"
                                                    title="Eliminar"
                                                >
                                                    🗑️
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
                                    {editingInstructor ? '✏️ Editar Instructor' : '✨ Nuevo Instructor'}
                                </h2>
                                <button onClick={closeModal} className="btn-close">✕</button>
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
                                                        <span>📷</span>
                                                        <p>Sin foto</p>
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
                                    <button type="button" onClick={closeModal} className="btn-cancel">
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
            </div>

            <style jsx>{`
                * { box-sizing: border-box; }

                .page-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0.5rem 0;
                }

                /* ── Header ── */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.75rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .page-title {
                    font-size: clamp(1.6rem, 4vw, 2.2rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    letter-spacing: 2px;
                    text-shadow: 0 0 20px rgba(255,20,147,0.5), 0 0 40px rgba(255,20,147,0.2);
                }

                .page-subtitle {
                    color: rgba(255,255,255,0.4);
                    margin: 0.4rem 0 0;
                    font-size: 0.875rem;
                }

                /* ── Buttons ── */
                .btn-primary {
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 20px rgba(255,20,147,0.4), 0 0 0 1px rgba(255,20,147,0.3);
                    white-space: nowrap;
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255,20,147,0.55);
                }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ── Search ── */
                .search-form {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .search-wrapper {
                    flex: 1;
                    min-width: 200px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: rgba(255,20,147,0.04);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                    outline: none;
                }
                .search-input::placeholder { color: rgba(255,255,255,0.3); }
                .search-input:focus {
                    border-color: rgba(255,20,147,0.6);
                    background: rgba(255,20,147,0.07);
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.1);
                }

                .btn-search {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.4);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s;
                    white-space: nowrap;
                }
                .btn-search:hover {
                    background: rgba(255,20,147,0.18);
                    border-color: #FF1493;
                }

                /* ── Glass Card ── */
                .glass-card {
                    background: rgba(255,20,147,0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow:
                        0 8px 32px rgba(0,0,0,0.4),
                        inset 0 1px 0 rgba(255,20,147,0.1);
                }

                .table-scroll { overflow-x: auto; }

                /* ── Table ── */
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 750px;
                }

                .table thead { background: rgba(255,20,147,0.07); }

                .table th {
                    padding: 1rem 1.25rem;
                    text-align: left;
                    color: #FF1493;
                    font-weight: 800;
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    border-bottom: 1px solid rgba(255,20,147,0.2);
                    white-space: nowrap;
                }

                .table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255,20,147,0.07);
                    color: rgba(255,255,255,0.75);
                    font-size: 0.875rem;
                    vertical-align: middle;
                }

                .table tbody tr { transition: background 0.2s; }
                .table tbody tr:hover { background: rgba(255,20,147,0.04); }
                .table tbody tr:last-child td { border-bottom: none; }

                .text-center { text-align: center !important; }
                .text-muted { color: rgba(255,255,255,0.3); font-style: italic; font-size: 0.8rem; }

                /* ── Instructor cell ── */
                .instructor-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                }

                .instructor-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(255,20,147,0.4);
                    box-shadow: 0 0 12px rgba(255,20,147,0.2);
                    flex-shrink: 0;
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .instructor-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .avatar-initial {
                    color: #000;
                    font-size: 1.4rem;
                    font-weight: 900;
                }

                .instructor-name {
                    color: #fff;
                    font-weight: 700;
                    margin: 0 0 0.2rem;
                    font-size: 0.9rem;
                }
                .instructor-email {
                    color: rgba(255,255,255,0.4);
                    margin: 0 0 0.2rem;
                    font-size: 0.78rem;
                }
                .instructor-spec {
                    color: #FF1493;
                    margin: 0;
                    font-size: 0.72rem;
                    font-style: italic;
                }

                /* ── Badges ── */
                .badges-wrap { display: flex; flex-wrap: wrap; gap: 0.4rem; }

                .esp-badge {
                    display: inline-block;
                    padding: 0.3rem 0.65rem;
                    border-radius: 6px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.7rem;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }

                .tarifa-value {
                    color: #FF1493;
                    font-weight: 700;
                    font-size: 0.875rem;
                }
                .tarifa-empty {
                    color: rgba(255,255,255,0.25);
                    font-style: italic;
                    font-size: 0.78rem;
                }

                .status-badge {
                    padding: 0.4rem 0.875rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.72rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s;
                    white-space: nowrap;
                }
                .status-active {
                    background: rgba(34,197,94,0.15);
                    color: #22c55e;
                    border: 1px solid rgba(34,197,94,0.35);
                }
                .status-inactive {
                    background: rgba(239,68,68,0.15);
                    color: #ef4444;
                    border: 1px solid rgba(239,68,68,0.35);
                }

                .actions { display: flex; gap: 0.5rem; }

                .btn-icon {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,20,147,0.2);
                    padding: 0.4rem 0.6rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-edit:hover {
                    background: rgba(59,130,246,0.15);
                    border-color: #3b82f6;
                }
                .btn-icon-delete:hover {
                    background: rgba(239,68,68,0.15);
                    border-color: #ef4444;
                }

                .empty-state {
                    text-align: center;
                    padding: 3.5rem 1rem !important;
                    color: rgba(255,255,255,0.25) !important;
                }
                .empty-state span { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
                .empty-state p { margin: 0; }

                /* ── Pagination ── */
                .pagination {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-top: 1.5rem;
                }

                .page-btn {
                    background: rgba(255,20,147,0.07);
                    border: 1px solid rgba(255,20,147,0.2);
                    color: #FF1493;
                    padding: 0.5rem 0.875rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                    font-size: 0.8rem;
                }
                .page-btn:hover:not(:disabled) { background: rgba(255,20,147,0.18); border-color: #FF1493; }
                .page-btn.active { background: #FF1493; color: #000; border-color: #FF1493; }
                .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                /* ── Modal ── */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.75);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-glass {
                    background: rgba(10, 3, 15, 0.88);
                    backdrop-filter: blur(30px);
                    -webkit-backdrop-filter: blur(30px);
                    border: 1px solid rgba(255,20,147,0.35);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 680px;
                    height: 90vh;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow:
                        0 30px 80px rgba(0,0,0,0.7),
                        0 0 60px rgba(255,20,147,0.15),
                        inset 0 1px 0 rgba(255,20,147,0.2);
                    overflow: hidden;
                    animation: modalIn 0.25s cubic-bezier(.34,1.56,.64,1);
                }

                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .modal-header {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 1.75rem;
                    border-bottom: 1px solid rgba(255,20,147,0.15);
                    background: rgba(255,20,147,0.04);
                }

                .modal-title {
                    color: #FF1493;
                    font-size: 1.2rem;
                    font-weight: 900;
                    margin: 0;
                }

                .btn-close {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.5);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                }
                .btn-close:hover {
                    color: #FF1493;
                    border-color: rgba(255,20,147,0.4);
                    background: rgba(255,20,147,0.1);
                    transform: rotate(90deg);
                }

                .modal-form-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                }

                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem 1.75rem;
                    min-height: 0;
                }

                .modal-footer {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1.25rem 1.75rem;
                    border-top: 1px solid rgba(255,20,147,0.15);
                    background: rgba(255,20,147,0.03);
                    flex-wrap: wrap;
                }

                /* ── Form ── */
                .form-group { margin-bottom: 1.25rem; }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-label {
                    display: block;
                    color: rgba(255,20,147,0.9);
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .label-hint {
                    color: rgba(255,255,255,0.3);
                    font-size: 0.7rem;
                    font-weight: 400;
                    text-transform: none;
                    margin-left: 0.5rem;
                }

                .form-input, .form-textarea {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(255,20,147,0.05);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.25s;
                    outline: none;
                }
                .form-input::placeholder, .form-textarea::placeholder { color: rgba(255,255,255,0.25); }
                .form-input:focus, .form-textarea:focus {
                    border-color: rgba(255,20,147,0.6);
                    background: rgba(255,20,147,0.08);
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.1);
                }
                .form-textarea { resize: vertical; font-family: inherit; }

                .form-error {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin: 0.4rem 0 0;
                }

                /* Foto */
                .foto-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .foto-preview {
                    width: 88px;
                    height: 88px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(255,20,147,0.3);
                    flex-shrink: 0;
                    background: rgba(255,20,147,0.07);
                }
                .foto-preview img { width: 100%; height: 100%; object-fit: cover; }

                .foto-placeholder {
                    width: 100%; height: 100%;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    color: rgba(255,255,255,0.3);
                }
                .foto-placeholder span { font-size: 1.75rem; }
                .foto-placeholder p { margin: 0.25rem 0 0; font-size: 0.7rem; }

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
                    transition: all 0.2s;
                }
                .btn-upload:hover { background: rgba(255,20,147,0.16); }

                /* Tipos grid */
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
                .tipo-option:hover .tipo-badge { transform: scale(1.04); }

                /* Prefix input */
                .input-prefix-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-prefix-symbol {
                    position: absolute;
                    left: 1rem;
                    color: #FF1493;
                    font-weight: 700;
                    pointer-events: none;
                }
                .form-input-prefixed { padding-left: 2.25rem; }

                /* Toggle */
                .toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: rgba(255,255,255,0.65);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                .toggle-checkbox {
                    width: 18px; height: 18px;
                    accent-color: #FF1493;
                    cursor: pointer;
                }

                .btn-cancel {
                    background: rgba(255,20,147,0.06);
                    border: 1px solid rgba(255,20,147,0.25);
                    color: #FF1493;
                    padding: 0.75rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .btn-cancel:hover { background: rgba(255,20,147,0.12); }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .btn-primary { width: 100%; justify-content: center; }
                    .search-form { flex-direction: column; }
                    .btn-search { width: 100%; }
                    .form-row { grid-template-columns: 1fr; }
                    .tipos-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
                    .modal-footer { flex-direction: column; }
                    .btn-cancel, .btn-primary { width: 100%; justify-content: center; }
                }

                @media (max-width: 480px) {
                    .modal-glass { border-radius: 16px; }
                    .instructor-avatar { width: 42px; height: 42px; }
                    .avatar-initial { font-size: 1.1rem; }
                }
            `}</style>
        </DashboardLayout>
    );
}

import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function InstructoresIndex({ auth, instructores, tiposClase, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [previewFoto, setPreviewFoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // reemplaza `processing`

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

    // ── FIX: router.post() con FormData directo ──────────────────────────────
    // El método post() del useForm ignora el parámetro `data: formData` y envía
    // los campos internos del hook en lugar del FormData construido manualmente.
    // Con router.post() el FormData va como segundo argumento y funciona bien.
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
            router.post(
                route('admin.instructores.update', editingInstructor.id),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => closeModal(),
                    onError: (errs) => {
                        setIsSubmitting(false);
                        Object.keys(errs).forEach(k => setError(k, errs[k]));
                    },
                }
            );
        } else {
            router.post(
                route('admin.instructores.store'),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => closeModal(),
                    onError: (errs) => {
                        setIsSubmitting(false);
                        Object.keys(errs).forEach(k => setError(k, errs[k]));
                    },
                }
            );
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

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
            reader.onloadend = () => {
                setPreviewFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEspecialidad = (tipoId) => {
        const current = [...data.especialidades_ids];
        const index = current.indexOf(tipoId);

        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(tipoId);
        }

        setData('especialidades_ids', current);
    };

    const formatCOP = (valor) => {
        const num = parseFloat(valor);
        if (!num || num === 0) return <span style={{ color: '#555', fontStyle: 'italic', fontSize: '0.8rem' }}>No definida</span>;
        return <span className="tarifa-value">${new Intl.NumberFormat('es-CO').format(num)} COP</span>;
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Instructores" />

            <div className="instructores-container">
                <div className="header">
                    <div>
                        <h1 className="title">INSTRUCTORES</h1>
                        <p className="subtitle">Gestiona el equipo de instructores del box</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-create">
                        <span className="icon">➕</span>
                        Nuevo Instructor
                    </button>
                </div>

                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, email o especialidad..."
                        className="search-input"
                    />
                    <button type="submit" className="btn-search">
                        🔍 Buscar
                    </button>
                </form>

                <div className="table-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Instructor</th>
                            <th>Especialidades</th>
                            {/* CAMBIO: dos columnas separadas en lugar de una "Tarifas" */}
                            <th style={{ textAlign: 'center' }}>💼 Tarifa por Clase</th>
                            <th style={{ textAlign: 'center' }}>👥 Tarifa por Asistente</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {instructores.data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    No hay instructores registrados
                                </td>
                            </tr>
                        ) : (
                            instructores.data.map((instructor) => (
                                <tr key={instructor.id}>
                                    <td>
                                        <div className="instructor-info">
                                            <div className="instructor-avatar">
                                                {instructor.foto_url ? (
                                                    <img src={instructor.foto_url} alt={instructor.user.name} />
                                                ) : (
                                                    <span className="avatar-placeholder">
                                                            {instructor.user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                )}
                                            </div>
                                            <div className="instructor-details">
                                                <p className="instructor-name">{instructor.user.name}</p>
                                                <p className="instructor-email">{instructor.user.email}</p>
                                                {instructor.especialidad && (
                                                    <p className="instructor-specialty">{instructor.especialidad}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="especialidades-badges">
                                            {instructor.especialidades.length > 0 ? (
                                                instructor.especialidades.map((tipo) => (
                                                    <span
                                                        key={tipo.id}
                                                        className="especialidad-badge"
                                                        style={{ backgroundColor: tipo.color }}
                                                    >
                                                            {tipo.nombre}
                                                        </span>
                                                ))
                                            ) : (
                                                <span className="no-especialidades">Sin especialidades</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* CAMBIO: columna propia para tarifa por clase */}
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        {formatCOP(instructor.tarifa_por_clase)}
                                    </td>

                                    {/* CAMBIO: columna propia para tarifa por asistente */}
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        {formatCOP(instructor.tarifa_por_asistente)}
                                    </td>

                                    <td>
                                        <button
                                            onClick={() => handleToggle(instructor)}
                                            className={`badge ${instructor.activo ? 'badge-active' : 'badge-inactive'}`}
                                        >
                                            {instructor.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                onClick={() => openEditModal(instructor)}
                                                className="btn-action btn-edit"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(instructor)}
                                                className="btn-action btn-delete"
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

                {instructores.links.length > 3 && (
                    <div className="pagination">
                        {instructores.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                className={`page-link ${link.active ? 'active' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        {/* El modal usa flex column para que el footer quede siempre visible */}
                        <div className="modal" onClick={(e) => e.stopPropagation()}>

                            {/* Header sticky arriba */}
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
                                </h2>
                                <button onClick={closeModal} className="btn-close">✕</button>
                            </div>

                            {/* Form ocupa todo el espacio restante con scroll interno */}
                            <form onSubmit={handleSubmit} className="modal-form-wrapper">

                                {/* Zona scrolleable */}
                                <div className="modal-body">

                                    {/* Foto de perfil */}
                                    <div className="form-group">
                                        <label className="label">Foto de perfil</label>
                                        <div className="foto-upload">
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
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFotoChange}
                                                className="foto-input"
                                                id="foto-input"
                                            />
                                            <label htmlFor="foto-input" className="foto-button">
                                                Seleccionar imagen
                                            </label>
                                        </div>
                                        {errors.foto && <p className="error">{errors.foto}</p>}
                                    </div>

                                    {/* Datos personales */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="label">Nombre completo *</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="input"
                                                placeholder="Ej: Carlos Martínez"
                                                required
                                            />
                                            {errors.name && <p className="error">{errors.name}</p>}
                                        </div>

                                        <div className="form-group">
                                            <label className="label">Correo electrónico *</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="input"
                                                placeholder="instructor@personalbox.com"
                                                required
                                            />
                                            {errors.email && <p className="error">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div className="form-group">
                                        <label className="label">
                                            Contraseña {!editingInstructor && '*'}
                                            {editingInstructor && <span className="label-hint">(dejar en blanco para mantener la actual)</span>}
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="input"
                                            placeholder="Mínimo 8 caracteres"
                                            required={!editingInstructor}
                                        />
                                        {errors.password && <p className="error">{errors.password}</p>}
                                    </div>

                                    {/* Especialidad principal */}
                                    <div className="form-group">
                                        <label className="label">Especialidad principal</label>
                                        <input
                                            type="text"
                                            value={data.especialidad}
                                            onChange={(e) => setData('especialidad', e.target.value)}
                                            className="input"
                                            placeholder="Ej: Crossfit y Musculación"
                                        />
                                        {errors.especialidad && <p className="error">{errors.especialidad}</p>}
                                    </div>

                                    {/* Tipos de clase que puede impartir */}
                                    <div className="form-group">
                                        <label className="label">Tipos de clase que puede impartir</label>
                                        <div className="tipos-clase-grid">
                                            {tiposClase.map((tipo) => (
                                                <label key={tipo.id} className="tipo-clase-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.especialidades_ids.includes(tipo.id)}
                                                        onChange={() => toggleEspecialidad(tipo.id)}
                                                    />
                                                    <span
                                                        className="tipo-clase-badge"
                                                        style={{
                                                            backgroundColor: data.especialidades_ids.includes(tipo.id) ? tipo.color : 'rgba(255, 20, 147, 0.1)',
                                                            borderColor: tipo.color
                                                        }}
                                                    >
                                                        {tipo.nombre}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.especialidades_ids && <p className="error">{errors.especialidades_ids}</p>}
                                    </div>

                                    {/* Tarifas */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="label">Tarifa por clase</label>
                                            <div className="input-with-prefix">
                                                <span className="input-prefix">$</span>
                                                <input
                                                    type="number"
                                                    value={data.tarifa_por_clase}
                                                    onChange={(e) => setData('tarifa_por_clase', e.target.value)}
                                                    className="input input-with-prefix-field"
                                                    placeholder="50000"
                                                    min="0"
                                                    step="1000"
                                                />
                                            </div>
                                            {errors.tarifa_por_clase && <p className="error">{errors.tarifa_por_clase}</p>}
                                        </div>

                                        <div className="form-group">
                                            <label className="label">Tarifa por asistente</label>
                                            <div className="input-with-prefix">
                                                <span className="input-prefix">$</span>
                                                <input
                                                    type="number"
                                                    value={data.tarifa_por_asistente}
                                                    onChange={(e) => setData('tarifa_por_asistente', e.target.value)}
                                                    className="input input-with-prefix-field"
                                                    placeholder="5000"
                                                    min="0"
                                                    step="1000"
                                                />
                                            </div>
                                            {errors.tarifa_por_asistente && <p className="error">{errors.tarifa_por_asistente}</p>}
                                        </div>
                                    </div>

                                    {/* Biografía */}
                                    <div className="form-group">
                                        <label className="label">Biografía</label>
                                        <textarea
                                            value={data.biografia}
                                            onChange={(e) => setData('biografia', e.target.value)}
                                            className="textarea"
                                            rows="4"
                                            placeholder="Describe la experiencia y certificaciones del instructor..."
                                        />
                                        {errors.biografia && <p className="error">{errors.biografia}</p>}
                                    </div>

                                    {/* Estado activo */}
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={data.activo}
                                                onChange={(e) => setData('activo', e.target.checked)}
                                                className="checkbox"
                                            />
                                            <span>Activo (puede impartir clases)</span>
                                        </label>
                                    </div>

                                </div>{/* fin modal-body */}

                                {/* Footer sticky SIEMPRE visible en la parte inferior */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="btn-cancel"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-submit"
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Guardar Instructor'}
                                    </button>
                                </div>

                            </form>{/* fin modal-form-wrapper */}

                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .instructores-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .title {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                }

                .subtitle {
                    color: #999;
                    margin: 0.5rem 0 0 0;
                    font-size: 0.875rem;
                }

                .btn-create {
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.4);
                }

                .btn-create:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.6);
                }

                .icon {
                    font-size: 1.25rem;
                }

                .search-form {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .search-input {
                    flex: 1;
                    padding: 0.875rem;
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                }

                .btn-search {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid #FF1493;
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-search:hover {
                    background: #FF1493;
                    color: #000;
                }

                .table-container {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .table thead {
                    background: rgba(255, 20, 147, 0.1);
                }

                .table th {
                    padding: 1rem;
                    text-align: left;
                    color: #FF1493;
                    font-weight: 900;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 2px solid rgba(255, 20, 147, 0.3);
                }

                .table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.1);
                    color: #ccc;
                }

                .table tbody tr:hover {
                    background: rgba(255, 20, 147, 0.05);
                }

                .instructor-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .instructor-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                }

                .instructor-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    color: #000;
                    font-size: 1.5rem;
                    font-weight: 900;
                }

                .instructor-details {
                    flex: 1;
                }

                .instructor-name {
                    color: #fff;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    font-size: 1rem;
                }

                .instructor-email {
                    color: #999;
                    margin: 0 0 0.25rem 0;
                    font-size: 0.875rem;
                }

                .instructor-specialty {
                    color: #FF1493;
                    margin: 0;
                    font-size: 0.75rem;
                    font-style: italic;
                }

                .especialidades-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .especialidad-badge {
                    display: inline-block;
                    padding: 0.375rem 0.75rem;
                    border-radius: 6px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    box-shadow: 0 0 10px currentColor;
                }

                .no-especialidades {
                    color: #666;
                    font-size: 0.875rem;
                    font-style: italic;
                }

                /* CAMBIO: nuevo estilo para el valor de tarifa en su propia celda */
                .tarifa-value {
                    color: #FF1493;
                    font-weight: 700;
                    font-size: 0.95rem;
                }

                .badge {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .badge-active {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    border: 1px solid #22c55e;
                }

                .badge-inactive {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid #ef4444;
                }

                .actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-action {
                    background: rgba(255, 20, 147, 0.1);
                    border: 1px solid rgba(255, 20, 147, 0.3);
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-size: 1.125rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-action:hover {
                    border-color: #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                }

                .btn-edit:hover {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: #3b82f6;
                }

                .btn-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem !important;
                    color: #666;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 2rem;
                }

                .page-link {
                    background: rgba(255, 20, 147, 0.1);
                    border: 1px solid rgba(255, 20, 147, 0.3);
                    color: #FF1493;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                }

                .page-link:hover:not(:disabled) {
                    background: #FF1493;
                    color: #000;
                }

                .page-link.active {
                    background: #FF1493;
                    color: #000;
                }

                .page-link:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                /* ══════════════════════════════
                   MODAL — estructura flex column
                   para que el footer sea siempre
                   visible sin scroll
                ══════════════════════════════ */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal {
                    background: rgba(10, 10, 10, 0.98);
                    border: 2px solid #FF1493;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 700px;
                    height: 90vh;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 40px rgba(255, 20, 147, 0.5);
                    overflow: hidden;
                }

                .modal-header {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.3);
                    background: rgba(10, 10, 10, 0.98);
                }

                .modal-title {
                    color: #FF1493;
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin: 0;
                }

                .btn-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-close:hover {
                    color: #FF1493;
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
                    padding: 1.5rem;
                    min-height: 0;
                }

                .modal-footer {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-top: 2px solid rgba(255, 20, 147, 0.3);
                    background: rgba(10, 10, 10, 0.98);
                }

                .btn-cancel {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-cancel:hover {
                    border-color: #FF1493;
                    background: rgba(255, 20, 147, 0.2);
                }

                .btn-submit {
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.4);
                }

                .btn-submit:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.6);
                }

                .btn-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .label {
                    display: block;
                    color: #FF1493;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .label-hint {
                    color: #999;
                    font-size: 0.7rem;
                    font-weight: 400;
                    text-transform: none;
                    margin-left: 0.5rem;
                }

                .input, .textarea {
                    width: 100%;
                    padding: 0.875rem;
                    background: #000;
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                .input:focus, .textarea:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                }

                .foto-upload {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .foto-preview {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    flex-shrink: 0;
                }

                .foto-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .foto-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 20, 147, 0.1);
                    color: #666;
                }

                .foto-placeholder span {
                    font-size: 2rem;
                    margin-bottom: 0.25rem;
                }

                .foto-placeholder p {
                    margin: 0;
                    font-size: 0.75rem;
                }

                .foto-input {
                    display: none;
                }

                .foto-button {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid #FF1493;
                    color: #FF1493;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .foto-button:hover {
                    background: #FF1493;
                    color: #000;
                }

                .tipos-clase-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 0.75rem;
                }

                .tipo-clase-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .tipo-clase-checkbox input {
                    display: none;
                }

                .tipo-clase-badge {
                    flex: 1;
                    padding: 0.625rem 0.875rem;
                    border-radius: 6px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-align: center;
                    border: 2px solid;
                    transition: all 0.3s;
                }

                .tipo-clase-checkbox:hover .tipo-clase-badge {
                    transform: scale(1.05);
                }

                .input-with-prefix {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-prefix {
                    position: absolute;
                    left: 1rem;
                    color: #FF1493;
                    font-weight: 700;
                    font-size: 1rem;
                    pointer-events: none;
                }

                .input-with-prefix-field {
                    padding-left: 2.5rem;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #ccc;
                    cursor: pointer;
                }

                .checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .error {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.5rem;
                }

                @media (max-width: 768px) {
                    .title {
                        font-size: 1.5rem;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .tipos-clase-grid {
                        grid-template-columns: 1fr;
                    }

                    .table-container {
                        overflow-x: auto;
                    }

                    .table {
                        min-width: 900px;
                    }

                    .modal-footer {
                        flex-direction: column;
                    }

                    .btn-cancel, .btn-submit {
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}

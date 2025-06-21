import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Edit3, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

const UserProfile = () => {
    const { user, updateProfile, updatePassword, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateProfileForm = () => {
        const newErrors = {};

        if (!profileData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!profileData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (profileData.phone && !/^\+?[1-9]\d{1,14}$/.test(profileData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Teléfono inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma la nueva contraseña';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!validateProfileForm()) return;

        try {
            await updateProfile(profileData);
            setSuccessMessage('Perfil actualizado correctamente');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrors({ general: error.message || 'Error al actualizar el perfil' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        try {
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);
            setSuccessMessage('Contraseña actualizada correctamente');
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrors({ password: error.message || 'Error al actualizar la contraseña' });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setShowPasswordForm(false);
        setErrors({});
        // Restaurar datos originales
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="user-profile">
            <div className="profile-header">
                <div className="avatar-section">
                    <div className="avatar">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" />
                        ) : (
                            <User className="avatar-icon" />
                        )}
                        <button className="avatar-edit-btn" title="Cambiar foto">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="user-info">
                        <h2>{user?.name || 'Usuario'}</h2>
                        <p className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                    </div>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            {errors.general && (
                <div className="error-message">
                    {errors.general}
                </div>
            )}

            <div className="profile-content">
                {/* Información del Perfil */}
                <div className="profile-section">
                    <div className="section-header">
                        <h3>Información Personal</h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="edit-btn"
                            >
                                <Edit3 size={16} />
                                Editar
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="name">
                                <User size={16} />
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={profileData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <Mail size={16} />
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                <Phone size={16} />
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={errors.phone ? 'error' : ''}
                                placeholder="Ej: +57 300 123 4567"
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">
                                <MapPin size={16} />
                                Dirección de entrega
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={profileData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows="3"
                                placeholder="Dirección completa para entregas"
                            />
                        </div>

                        {isEditing && (
                            <div className="form-actions">
                                <button type="submit" className="save-btn" disabled={loading}>
                                    <Save size={16} />
                                    {loading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button type="button" onClick={handleCancel} className="cancel-btn">
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Cambiar Contraseña */}
                <div className="profile-section">
                    <div className="section-header">
                        <h3>Seguridad</h3>
                        {!showPasswordForm && !user?.oauth_provider && (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="edit-btn"
                            >
                                <Lock size={16} />
                                Cambiar contraseña
                            </button>
                        )}
                    </div>

                    {user?.oauth_provider ? (
                        <p className="oauth-info">
                            Tu cuenta está vinculada con {user.oauth_provider}.
                            No puedes cambiar la contraseña desde aquí.
                        </p>
                    ) : showPasswordForm ? (
                        <form onSubmit={handleChangePassword} className="password-form">
                            {errors.password && (
                                <div className="error-message">
                                    {errors.password}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="currentPassword">Contraseña actual</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className={errors.currentPassword ? 'error' : ''}
                                />
                                {errors.currentPassword && (
                                    <span className="error-text">{errors.currentPassword}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className={errors.newPassword ? 'error' : ''}
                                />
                                {errors.newPassword && (
                                    <span className="error-text">{errors.newPassword}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && (
                                    <span className="error-text">{errors.confirmPassword}</span>
                                )}
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="save-btn" disabled={loading}>
                                    <Save size={16} />
                                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                                </button>
                                <button type="button" onClick={handleCancel} className="cancel-btn">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="password-info">
                            Mantén tu cuenta segura con una contraseña fuerte.
                        </p>
                    )}
                </div>
            </div>

            <style jsx>{`
        .user-profile {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--gray-light);
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .avatar {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--secondary-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-icon {
          color: var(--primary-orange);
          width: 40px;
          height: 40px;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--primary-orange);
          color: white;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .avatar-edit-btn:hover {
          background: var(--accent-red);
          transform: scale(1.1);
        }

        .user-info h2 {
          margin: 0;
          color: var(--black);
          font-size: 1.5rem;
        }

        .user-role {
          margin: 0.25rem 0 0 0;
          color: var(--gray-dark);
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .success-message {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 0.5rem;
          color: #0c4a6e;
          text-align: center;
        }

        .error-message {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          color: #dc2626;
          text-align: center;
        }

        .profile-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 2px solid var(--gray-light);
          border-radius: 0.75rem;
        }

        .section-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          margin: 0;
          color: var(--black);
          font-size: 1.25rem;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary-orange);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: var(--accent-red);
          transform: translateY(-1px);
        }

        .profile-form, .password-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--gray-dark);
          font-size: 0.875rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid var(--gray-medium);
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-orange);
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background: var(--gray-light);
          color: var(--gray-dark);
          cursor: not-allowed;
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #dc2626;
        }

        .error-text {
          color: #dc2626;
          font-size: 0.875rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary-orange);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--accent-red);
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          background: transparent;
          color: var(--gray-dark);
          border: 2px solid var(--gray-medium);
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          border-color: var(--primary-orange);
          color: var(--primary-orange);
        }

        .oauth-info, .password-info {
          color: var(--gray-dark);
          font-size: 0.875rem;
          margin: 0;
          padding: 1rem;
          background: var(--gray-light);
          border-radius: 0.5rem;
        }

        @media (max-width: 768px) {
          .user-profile {
            padding: 1rem;
            margin: 1rem;
          }

          .avatar-section {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
};

export default UserProfile;
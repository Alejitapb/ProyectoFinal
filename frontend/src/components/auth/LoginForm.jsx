import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SocialLogin from './SocialLogin';
import toast from 'react-hot-toast';

const LoginForm = ({ onClose, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('¡Bienvenido de vuelta!');
            onClose();
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.status === 401) {
                setErrors({ general: 'Email o contraseña incorrectos' });
            } else {
                setErrors({ general: 'Error al iniciar sesión. Intenta de nuevo.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
                    <p className="text-gray-600 mt-1">Accede a tu cuenta</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </button>
            </div>

            {/* General Error */}
            {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-red-700 text-sm">{errors.general}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`
                w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange
                ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'}
              `}
                            placeholder="tu@email.com"
                            disabled={isLoading}
                        />
                        <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`
                w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange
                ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'}
              `}
                            placeholder="Tu contraseña"
                            disabled={isLoading}
                        />
                        <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={isLoading}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-orange focus:ring-primary-orange border-gray-300 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                    </label>
                    <button
                        type="button"
                        className="text-sm text-primary-orange hover:text-primary-red transition-colors"
                        disabled={isLoading}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-orange text-white hover:bg-primary-red focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2'
                    }
          `}
                >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">o continúa con</span>
                <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Social Login */}
            <SocialLogin />

            {/* Switch to Register */}
            <div className="mt-6 text-center">
                <p className="text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-primary-orange hover:text-primary-red font-medium transition-colors"
                        disabled={isLoading}
                    >
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
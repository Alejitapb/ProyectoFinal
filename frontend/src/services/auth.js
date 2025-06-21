import { apiRequest, handleApiError } from './api.js';

export const authService = {
    // Registro de usuario
    register: async (userData) => {
        try {
            const response = await apiRequest.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Inicio de sesión
    login: async (credentials) => {
        try {
            const response = await apiRequest.post('/auth/login', credentials);
            const { token, user } = response.data;

            // Guardar token y usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
    },

    // Obtener usuario actual
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Verificar si el usuario está autenticado
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            // Verificar si el token no ha expirado (opcional)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    },

    // Obtener perfil del usuario
    getProfile: async () => {
        try {
            const response = await apiRequest.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar perfil
    updateProfile: async (userData) => {
        try {
            const response = await apiRequest.put('/auth/profile', userData);

            // Actualizar usuario en localStorage
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Cambiar contraseña
    changePassword: async (passwordData) => {
        try {
            const response = await apiRequest.put('/auth/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Recuperar contraseña (solicitar reset)
    forgotPassword: async (email) => {
        try {
            const response = await apiRequest.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Reset de contraseña
    resetPassword: async (token, newPassword) => {
        try {
            const response = await apiRequest.post('/auth/reset-password', {
                token,
                password: newPassword
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Login con Google
    googleLogin: async (token) => {
        try {
            const response = await apiRequest.post('/auth/google', { token });
            const { token: authToken, user } = response.data;

            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Login con Facebook
    facebookLogin: async (accessToken) => {
        try {
            const response = await apiRequest.post('/auth/facebook', { accessToken });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Verificar token
    verifyToken: async () => {
        try {
            const response = await apiRequest.get('/auth/verify');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
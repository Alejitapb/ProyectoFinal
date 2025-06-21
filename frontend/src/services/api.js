import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para responses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Funciones helper para requests
export const apiRequest = {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data = {}, config = {}) => api.post(url, data, config),
    put: (url, data = {}, config = {}) => api.put(url, data, config),
    patch: (url, data = {}, config = {}) => api.patch(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),
};

// Función para subir archivos
export const uploadFile = (url, formData, onUploadProgress) => {
    return api.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
};

// Función para manejar errores de API
export const handleApiError = (error) => {
    if (error.response) {
        // El servidor respondió con un código de error
        return {
            message: error.response.data.message || 'Error en el servidor',
            status: error.response.status,
            data: error.response.data,
        };
    } else if (error.request) {
        // No se recibió respuesta
        return {
            message: 'No se pudo conectar con el servidor',
            status: 0,
            data: null,
        };
    } else {
        // Error en la configuración de la request
        return {
            message: error.message || 'Error desconocido',
            status: 0,
            data: null,
        };
    }
};

export default api;
export { apiRequest as api };
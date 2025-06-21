import { apiRequest, handleApiError } from './api.js';

export const reviewsService = {
    // Crear nueva reseña
    createReview: async (reviewData) => {
        try {
            const response = await apiRequest.post('/reviews', reviewData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener reseñas de un producto
    getProductReviews: async (productId, page = 1, limit = 10) => {
        try {
            const response = await apiRequest.get(
                `/reviews/product/${productId}?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener reseñas del usuario
    getUserReviews: async (page = 1, limit = 10) => {
        try {
            const response = await apiRequest.get(`/reviews/user?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener reseña por ID
    getReviewById: async (reviewId) => {
        try {
            const response = await apiRequest.get(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar reseña
    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await apiRequest.put(`/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Eliminar reseña
    deleteReview: async (reviewId) => {
        try {
            const response = await apiRequest.delete(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener estadísticas de reseñas de un producto
    getProductReviewStats: async (productId) => {
        try {
            const response = await apiRequest.get(`/reviews/product/${productId}/stats`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Verificar si el usuario puede reseñar un producto
    canUserReviewProduct: async (productId) => {
        try {
            const response = await apiRequest.get(`/reviews/can-review/${productId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Marcar reseña como útil
    markReviewHelpful: async (reviewId) => {
        try {
            const response = await apiRequest.post(`/reviews/${reviewId}/helpful`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Reportar reseña
    reportReview: async (reviewId, reason) => {
        try {
            const response = await apiRequest.post(`/reviews/${reviewId}/report`, { reason });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener reseñas recientes
    getRecentReviews: async (limit = 5) => {
        try {
            const response = await apiRequest.get(`/reviews/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // ========== FUNCIONES ADMIN ==========

    // Obtener todas las reseñas (Admin)
    getAllReviews: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.status) queryParams.append('status', filters.status);
            if (filters.rating) queryParams.append('rating', filters.rating);
            if (filters.productId) queryParams.append('productId', filters.productId);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

            const url = queryParams.toString() ? `/reviews/admin/all?${queryParams}` : '/reviews/admin/all';
            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Aprobar reseña (Admin)
    approveReview: async (reviewId) => {
        try {
            const response = await apiRequest.put(`/reviews/admin/${reviewId}/approve`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Rechazar reseña (Admin)
    rejectReview: async (reviewId, reason = '') => {
        try {
            const response = await apiRequest.put(`/reviews/admin/${reviewId}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Eliminar reseña (Admin)
    adminDeleteReview: async (reviewId) => {
        try {
            const response = await apiRequest.delete(`/reviews/admin/${reviewId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener estadísticas generales de reseñas (Admin)
    getReviewStatistics: async () => {
        try {
            const response = await apiRequest.get('/reviews/admin/statistics');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener reseñas pendientes de aprobación (Admin)
    getPendingReviews: async (page = 1, limit = 10) => {
        try {
            const response = await apiRequest.get(
                `/reviews/admin/pending?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
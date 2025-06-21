import { apiRequest, handleApiError } from './api.js';

export const ordersService = {
    // Crear nuevo pedido
    createOrder: async (orderData) => {
        try {
            const response = await apiRequest.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener pedidos del usuario
    getUserOrders: async (page = 1, limit = 10) => {
        try {
            const response = await apiRequest.get(`/orders?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener pedido por ID
    getOrderById: async (orderId) => {
        try {
            const response = await apiRequest.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener pedido por número de orden
    getOrderByNumber: async (orderNumber) => {
        try {
            const response = await apiRequest.get(`/orders/number/${orderNumber}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Cancelar pedido
    cancelOrder: async (orderId, reason = '') => {
        try {
            const response = await apiRequest.put(`/orders/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Rastrear pedido
    trackOrder: async (orderNumber) => {
        try {
            const response = await apiRequest.get(`/orders/track/${orderNumber}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener estadísticas de pedidos del usuario
    getUserOrderStats: async () => {
        try {
            const response = await apiRequest.get('/orders/stats/user');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Repetir pedido anterior
    reorderPrevious: async (orderId) => {
        try {
            const response = await apiRequest.post(`/orders/${orderId}/reorder`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Confirmar recepción del pedido
    confirmDelivery: async (orderId, rating = null, comment = '') => {
        try {
            const response = await apiRequest.put(`/orders/${orderId}/confirm-delivery`, {
                rating,
                comment
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener historial de estados del pedido
    getOrderHistory: async (orderId) => {
        try {
            const response = await apiRequest.get(`/orders/${orderId}/history`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Calcular costo de envío
    calculateShipping: async (address, items) => {
        try {
            const response = await apiRequest.post('/orders/calculate-shipping', {
                address,
                items
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Validar cupón de descuento
    validateCoupon: async (couponCode, orderTotal) => {
        try {
            const response = await apiRequest.post('/orders/validate-coupon', {
                couponCode,
                orderTotal
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // ========== FUNCIONES ADMIN ==========

    // Obtener todos los pedidos (Admin)
    getAllOrders: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.status) queryParams.append('status', filters.status);
            if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

            const url = queryParams.toString() ? `/orders/admin/all?${queryParams}` : '/orders/admin/all';
            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar estado del pedido (Admin)
    updateOrderStatus: async (orderId, status, notes = '') => {
        try {
            const response = await apiRequest.put(`/orders/admin/${orderId}/status`, {
                status,
                notes
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar estado de pago (Admin)
    updatePaymentStatus: async (orderId, paymentStatus, transactionId = '') => {
        try {
            const response = await apiRequest.put(`/orders/admin/${orderId}/payment-status`, {
                paymentStatus,
                transactionId
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Asignar tiempo estimado de entrega (Admin)
    updateDeliveryTime: async (orderId, estimatedDeliveryTime) => {
        try {
            const response = await apiRequest.put(`/orders/admin/${orderId}/delivery-time`, {
                estimatedDeliveryTime
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener estadísticas de pedidos (Admin)
    getOrderStatistics: async (period = 'month') => {
        try {
            const response = await apiRequest.get(`/orders/admin/statistics?period=${period}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener reporte de ventas (Admin)
    getSalesReport: async (startDate, endDate) => {
        try {
            const response = await apiRequest.get(
                `/orders/admin/sales-report?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Exportar órdenes a Excel (Admin)
    exportOrders: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.status) queryParams.append('status', filters.status);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);

            const response = await apiRequest.get(`/orders/admin/export?${queryParams}`, {
                responseType: 'blob'
            });

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
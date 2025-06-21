import { apiRequest, handleApiError } from './api';

export const adminService = {
    // Obtener todos los pedidos (Admin)
    getAllOrders: async () => {
        try {
            const response = await apiRequest.get('/orders/admin/all');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar estado del pedido (Admin)
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await apiRequest.put(`/orders/admin/${orderId}/status`, {
                status
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

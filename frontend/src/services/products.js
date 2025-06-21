import { apiRequest, handleApiError } from './api.js';

export const productsService = {
    // Obtener todos los productos
    getAllProducts: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.category) queryParams.append('category', filters.category);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            if (filters.available !== undefined) queryParams.append('available', filters.available);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const url = queryParams.toString() ? `/products?${queryParams}` : '/products';
            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener producto por ID
    getProductById: async (id) => {
        try {
            const response = await apiRequest.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener productos por categoría
    getProductsByCategory: async (categoryId, filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const url = queryParams.toString()
                ? `/products/category/${categoryId}?${queryParams}`
                : `/products/category/${categoryId}`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Buscar productos
    searchProducts: async (searchTerm, filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('search', searchTerm);

            if (filters.category) queryParams.append('category', filters.category);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const response = await apiRequest.get(`/products/search?${queryParams}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener productos destacados
    getFeaturedProducts: async (limit = 6) => {
        try {
            const response = await apiRequest.get(`/products/featured?limit=${limit}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener todas las categorías
    getCategories: async () => {
        try {
            const response = await apiRequest.get('/products/categories');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Obtener categoría por ID
    getCategoryById: async (id) => {
        try {
            const response = await apiRequest.get(`/products/categories/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Crear producto (Admin)
    createProduct: async (productData) => {
        try {
            const response = await apiRequest.post('/products', productData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar producto (Admin)
    updateProduct: async (id, productData) => {
        try {
            const response = await apiRequest.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Eliminar producto (Admin)
    deleteProduct: async (id) => {
        try {
            const response = await apiRequest.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Subir imagen de producto (Admin)
    uploadProductImage: async (productId, imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await apiRequest.post(`/products/${productId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Actualizar stock (Admin)
    updateStock: async (id, quantity) => {
        try {
            const response = await apiRequest.patch(`/products/${id}/stock`, { quantity });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Alternar disponibilidad (Admin)
    toggleAvailability: async (id) => {
        try {
            const response = await apiRequest.patch(`/products/${id}/availability`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
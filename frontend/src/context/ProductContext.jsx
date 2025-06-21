import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { productsService } from '../services/products';

export const ProductContext = createContext();

const initialState = {
    products: [],
    categories: [],
    featuredProducts: [],
    selectedCategory: null,
    searchQuery: '',
    sortBy: 'name',
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    }
};

const productReducer = (state, action) => {
    switch (action.type) {
        case 'LOADING':
            return { ...state, isLoading: true, error: null };

        case 'LOAD_PRODUCTS_SUCCESS':
            return {
                ...state,
                products: action.payload.products,
                pagination: action.payload.pagination,
                isLoading: false,
                error: null
            };

        case 'LOAD_CATEGORIES_SUCCESS':
            return {
                ...state,
                categories: action.payload,
                isLoading: false,
                error: null
            };

        case 'LOAD_FEATURED_SUCCESS':
            return {
                ...state,
                featuredProducts: action.payload,
                isLoading: false,
                error: null
            };

        case 'SET_CATEGORY_FILTER':
            return {
                ...state,
                selectedCategory: action.payload,
                pagination: { ...state.pagination, page: 1 }
            };

        case 'SET_SEARCH_QUERY':
            return {
                ...state,
                searchQuery: action.payload,
                pagination: { ...state.pagination, page: 1 }
            };

        case 'SET_SORT_BY':
            return {
                ...state,
                sortBy: action.payload,
                pagination: { ...state.pagination, page: 1 }
            };

        case 'SET_PAGE':
            return {
                ...state,
                pagination: { ...state.pagination, page: action.payload }
            };

        case 'UPDATE_PRODUCT':
            return {
                ...state,
                products: state.products.map(product =>
                    product.id === action.payload.id ? { ...product, ...action.payload } : product
                ),
                featuredProducts: state.featuredProducts.map(product =>
                    product.id === action.payload.id ? { ...product, ...action.payload } : product
                )
            };

        case 'ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        default:
            return state;
    }
};

export const ProductProvider = ({ children }) => {
    const [state, dispatch] = useReducer(productReducer, initialState);

    // Cargar datos iniciales
    useEffect(() => {
        loadCategories();
        loadFeaturedProducts();
    }, []);

    // Cargar productos cuando cambien los filtros
    useEffect(() => {
        loadProducts();
    }, [state.selectedCategory, state.searchQuery, state.sortBy, state.pagination.page]);

    const loadProducts = async () => {
        try {
            dispatch({ type: 'LOADING' });

            const params = {
                page: state.pagination.page,
                limit: state.pagination.limit,
                category: state.selectedCategory,
                search: state.searchQuery,
                sortBy: state.sortBy
            };

            const response = await productService.getProducts(params);

            if (response.success) {
                dispatch({
                    type: 'LOAD_PRODUCTS_SUCCESS',
                    payload: {
                        products: response.data.products,
                        pagination: response.data.pagination
                    }
                });
            } else {
                dispatch({ type: 'ERROR', payload: response.message });
            }
        } catch (error) {
            dispatch({ type: 'ERROR', payload: 'Error al cargar productos' });
        }
    };

    const loadCategories = async () => {
        try {
            const response = await productService.getCategories();

            if (response.success) {
                dispatch({ type: 'LOAD_CATEGORIES_SUCCESS', payload: response.data });
            } else {
                dispatch({ type: 'ERROR', payload: response.message });
            }
        } catch (error) {
            dispatch({ type: 'ERROR', payload: 'Error al cargar categorías' });
        }
    };

    const loadFeaturedProducts = async () => {
        try {
            const response = await productService.getFeaturedProducts();

            if (response.success) {
                dispatch({ type: 'LOAD_FEATURED_SUCCESS', payload: response.data });
            } else {
                dispatch({ type: 'ERROR', payload: response.message });
            }
        } catch (error) {
            dispatch({ type: 'ERROR', payload: 'Error al cargar productos destacados' });
        }
    };

    const getProductById = async (id) => {
        try {
            // Buscar primero en el estado local
            let product = state.products.find(p => p.id === parseInt(id));
            if (!product) {
                product = state.featuredProducts.find(p => p.id === parseInt(id));
            }

            if (product) {
                return { success: true, data: product };
            }

            // Si no está en el estado, hacer petición al servidor
            const response = await productService.getProductById(id);
            return response;
        } catch (error) {
            return { success: false, message: 'Error al obtener producto' };
        }
    };

    const searchProducts = (query) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    };

    const filterByCategory = (categoryId) => {
        dispatch({ type: 'SET_CATEGORY_FILTER', payload: categoryId });
    };

    const sortProducts = (sortBy) => {
        dispatch({ type: 'SET_SORT_BY', payload: sortBy });
    };

    const changePage = (page) => {
        dispatch({ type: 'SET_PAGE', payload: page });
    };

    const clearFilters = () => {
        dispatch({ type: 'SET_CATEGORY_FILTER', payload: null });
        dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
        dispatch({ type: 'SET_SORT_BY', payload: 'name' });
    };

    const updateProductRating = (productId, newRating, reviewCount) => {
        dispatch({
            type: 'UPDATE_PRODUCT',
            payload: {
                id: productId,
                rating: newRating,
                total_reviews: reviewCount
            }
        });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const getFilteredProducts = () => {
        let filtered = [...state.products];

        if (state.searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(state.searchQuery.toLowerCase())
            );
        }

        if (state.selectedCategory) {
            filtered = filtered.filter(product => product.category_id === state.selectedCategory);
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            switch (state.sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    };

    const getCategoryName = (categoryId) => {
        const category = state.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Sin categoría';
    };

    const value = {
        ...state,
        loadProducts,
        loadCategories,
        loadFeaturedProducts,
        getProductById,
        searchProducts,
        filterByCategory,
        sortProducts,
        changePage,
        clearFilters,
        updateProductRating,
        clearError,
        getFilteredProducts,
        getCategoryName
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts debe ser usado dentro de ProductProvider');
    }
    return context;
};
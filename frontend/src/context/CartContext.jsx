import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ordersService as orderService } from '../services/orders';
import { CART_CONFIG } from '../utils/constants';

export const CartContext = createContext();
const { DELIVERY_FEE, MIN_ORDER_AMOUNT } = CART_CONFIG;

const initialState = {
    items: [],
    isLoading: false,
    error: null,
    total: 0,
    subtotal: 0,
    deliveryFee: DELIVERY_FEE,
    itemCount: 0
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'LOADING':
            return { ...state, isLoading: true, error: null };
        case 'LOAD_CART':
            const items = action.payload || [];
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = subtotal >= MIN_ORDER_AMOUNT ? subtotal + DELIVERY_FEE : subtotal;
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            return { ...state, items, subtotal, total, itemCount, isLoading: false, error: null };
        case 'ERROR':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { user, isAuthenticated } = useAuth();

    // ⛔ Proteger el uso de AuthContext si aún no está listo
    if (typeof user === 'undefined' || typeof isAuthenticated === 'undefined') {
        return null; // O muestra un spinner opcional
    }

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadCart();
        } else {
            loadLocalCart();
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('cart', JSON.stringify(state.items));
        }
    }, [state.items, isAuthenticated]);

    const loadCart = async () => {
        try {
            dispatch({ type: 'LOADING' });
            const res = await orderService.getCart();
            if (res.success) {
                dispatch({ type: 'LOAD_CART', payload: res.data });
            } else {
                dispatch({ type: 'ERROR', payload: res.message });
            }
        } catch (e) {
            dispatch({ type: 'ERROR', payload: 'Error al cargar el carrito' });
        }
    };

    const loadLocalCart = () => {
        try {
            const localCart = localStorage.getItem('cart');
            const items = localCart ? JSON.parse(localCart) : [];
            if (!Array.isArray(items)) throw new Error('Carrito inválido');
            dispatch({ type: 'LOAD_CART', payload: items });
        } catch {
            dispatch({ type: 'LOAD_CART', payload: [] });
        }
    };

    const value = {
        ...state,
        // para mantenerlo simple solo usa funciones vacías mientras haces debug
        addItem: () => {},
        updateQuantity: () => {},
        removeItem: () => {},
        clearCart: () => {},
        isMinOrderMet: () => state.subtotal >= MIN_ORDER_AMOUNT,
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de CartProvider');
    }
    return context;
};
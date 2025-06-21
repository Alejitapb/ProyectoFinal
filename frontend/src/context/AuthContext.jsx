import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import { getStoredUser, removeStoredUser, storeUser } from '../utils/helpers';
export const AuthContext = createContext();

const initialState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOADING':
            return { ...state, isLoading: true, error: null };

        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isLoading: false,
                isAuthenticated: true,
                error: null
            };

        case 'LOGIN_ERROR':
            return {
                ...state,
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: action.payload
            };

        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null
            };

        case 'UPDATE_PROFILE':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
                error: null
            };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verificar token al cargar la aplicación
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = getStoredUser();
                if (storedUser && storedUser.token) {
                    // Verificar si el token es válido
                    const response = await authService.verifyToken();
                    if (response.success) {
                        dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser });
                    } else {
                        removeStoredUser();
                        dispatch({ type: 'LOGOUT' });
                    }
                } else {
                    dispatch({ type: 'LOGOUT' });
                }
            } catch (error) {
                removeStoredUser();
                dispatch({ type: 'LOGOUT' });
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            dispatch({ type: 'LOADING' });
            const response = await authService.login(credentials);

            if (response.success) {
                const userData = {
                    ...response.data.user,
                    token: response.data.token
                };

                storeUser(userData);
                dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
                return { success: true };
            } else {
                dispatch({ type: 'LOGIN_ERROR', payload: response.message });
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            dispatch({ type: 'LOGIN_ERROR', payload: message });
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'LOADING' });
            const response = await authService.register(userData);

            if (response.success) {
                const userWithToken = {
                    ...response.data.user,
                    token: response.data.token
                };

                storeUser(userWithToken);
                dispatch({ type: 'LOGIN_SUCCESS', payload: userWithToken });
                return { success: true };
            } else {
                dispatch({ type: 'LOGIN_ERROR', payload: response.message });
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al registrarse';
            dispatch({ type: 'LOGIN_ERROR', payload: message });
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error durante logout:', error);
        } finally {
            removeStoredUser();
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await authService.updateProfile(profileData);

            if (response.success) {
                const updatedUser = { ...state.user, ...response.data };
                storeUser(updatedUser);
                dispatch({ type: 'UPDATE_PROFILE', payload: response.data });
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al actualizar perfil';
            return { success: false, message };
        }
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};
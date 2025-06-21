// Configuración de la aplicación
export const APP_CONFIG = {
    NAME: 'Cali Pollo Delivery',
    VERSION: '1.0.0',
    DESCRIPTION: 'Delivery de pollo frito al estilo caribeño',
    AUTHOR: 'Alejandra Pabón Barbosa',
    EMAIL: 'contacto@calipollo.com',
    PHONE: '+57 300 123 4567',
    ADDRESS: 'Carrera 10 #15-25, Sabanalarga, Atlántico',
};

// URLs de la API
export const API_ENDPOINTS = {
    AUTH: '/auth',
    PRODUCTS: '/products',
    ORDERS: '/orders',
    REVIEWS: '/reviews',
    ADMIN: '/admin',
    UPLOAD: '/upload',
};

// Estados de pedidos
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

// Traducciones de estados de pedidos
export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Pendiente',
    [ORDER_STATUS.CONFIRMED]: 'Confirmado',
    [ORDER_STATUS.PREPARING]: 'Preparando',
    [ORDER_STATUS.READY]: 'Listo',
    [ORDER_STATUS.DELIVERED]: 'Entregado',
    [ORDER_STATUS.CANCELLED]: 'Cancelado',
};

// Estados de pago
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
};

// Traducciones de estados de pago
export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]: 'Pendiente',
    [PAYMENT_STATUS.PAID]: 'Pagado',
    [PAYMENT_STATUS.FAILED]: 'Fallido',
};

// Métodos de pago
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    TRANSFER: 'transfer',
    NEQUI: 'nequi',
    DAVIPLATA: 'daviplata',
};

// Traducciones de métodos de pago
export const PAYMENT_METHODS_LABELS = {
    [PAYMENT_METHODS.CASH]: 'Efectivo',
    [PAYMENT_METHODS.CARD]: 'Tarjeta',
    [PAYMENT_METHODS.TRANSFER]: 'Transferencia',
    [PAYMENT_METHODS.NEQUI]: 'Nequi',
    [PAYMENT_METHODS.DAVIPLATA]: 'Daviplata',
};

// Roles de usuario
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
};

// Límites de paginación
export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    PRODUCTS_PER_PAGE: 12,
    REVIEWS_PER_PAGE: 5,
    ORDERS_PER_PAGE: 10,
};

// Configuración del carrito
export const CART_CONFIG = {
    MAX_QUANTITY: 10,
    MIN_ORDER_AMOUNT: 15000,
    DELIVERY_FEE: 3000,
    TAX_RATE: 0.19,
};

// Categorías de productos
export const PRODUCT_CATEGORIES = {
    FRIED_CHICKEN: 'pollo-frito',
    RICE: 'arroces',
    SIDES: 'acompañantes',
    DRINKS: 'bebidas',
    DESSERTS: 'postres',
};

// Tiempos de preparación (en minutos)
export const PREPARATION_TIMES = {
    FAST: 15,
    MEDIUM: 25,
    SLOW: 35,
};

// Rangos de calificación
export const RATING_RANGE = {
    MIN: 1,
    MAX: 5,
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
    VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
    NOT_FOUND: 'El recurso solicitado no existe.',
    CART_EMPTY: 'El carrito está vacío.',
    INSUFFICIENT_STOCK: 'Stock insuficiente.',
    INVALID_CREDENTIALS: 'Credenciales inválidas.',
    ACCOUNT_DISABLED: 'Cuenta deshabilitada.',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: '¡Bienvenido!',
    REGISTER_SUCCESS: 'Cuenta creada exitosamente.',
    ORDER_CREATED: 'Pedido realizado con éxito.',
    ORDER_CANCELLED: 'Pedido cancelado.',
    PROFILE_UPDATED: 'Perfil actualizado.',
    REVIEW_SUBMITTED: 'Reseña enviada.',
    ITEM_ADDED_TO_CART: 'Producto agregado al carrito.',
    ITEM_REMOVED_FROM_CART: 'Producto eliminado del carrito.',
};

// Configuración de validaciones
export const VALIDATION_RULES = {
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    },
    PHONE: {
        PATTERN: /^[+]?[\d\s-()]{10,15}$/,
    },
    PRICE: {
        MIN: 0,
        MAX: 999999,
    },
};

// Configuración de archivos
export const FILE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Rutas de navegación
export const ROUTES = {
    HOME: '/',
    MENU: '/menu',
    PRODUCT_DETAILS: '/product/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAILS: '/orders/:id',
    PROFILE: '/profile',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN: '/admin',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_REVIEWS: '/admin/reviews',
    SUPPORT: '/support',
};

// Configuración de toast notifications
export const TOAST_CONFIG = {
    DURATION: 4000,
    POSITION: 'top-right',
};

// Colores del tema
export const THEME_COLORS = {
    PRIMARY_YELLOW: '#FFD700',
    PRIMARY_ORANGE: '#FF8C00',
    PRIMARY_RED: '#FF4500',
    SECONDARY_YELLOW: '#FFF8DC',
    SECONDARY_ORANGE: '#FFE4B5',
    ACCENT_RED: '#DC143C',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_LIGHT: '#F5F5F5',
    GRAY_MEDIUM: '#CCCCCC',
    GRAY_DARK: '#666666',
};

// Configuración de localStorage
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CART: 'cart',
    PREFERENCES: 'preferences',
    THEME: 'theme',
};

// Configuración de fechas
export const DATE_CONFIG = {
    FORMAT: 'DD/MM/YYYY',
    FORMAT_WITH_TIME: 'DD/MM/YYYY HH:mm',
    LOCALE: 'es-CO',
};

// Horarios de atención
export const BUSINESS_HOURS = {
    MONDAY: { open: '11:00', close: '22:00' },
    TUESDAY: { open: '11:00', close: '22:00' },
    WEDNESDAY: { open: '11:00', close: '22:00' },
    THURSDAY: { open: '11:00', close: '22:00' },
    FRIDAY: { open: '11:00', close: '23:00' },
    SATURDAY: { open: '11:00', close: '23:00' },
    SUNDAY: { open: '12:00', close: '21:00' },
};

// Configuración de la aplicación
export const FEATURES = {
    ENABLE_REVIEWS: true,
    ENABLE_SOCIAL_LOGIN: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: false,
    ENABLE_LOYALTY_PROGRAM: false,
};

// URLs de redes sociales
export const SOCIAL_MEDIA = {
    FACEBOOK: 'https://facebook.com/calipollo',
    INSTAGRAM: 'https://instagram.com/calipollo',
    WHATSAPP: 'https://wa.me/573001234567',
    TWITTER: 'https://twitter.com/calipollo',
};

export default {
    APP_CONFIG,
    API_ENDPOINTS,
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_METHODS,
    PAYMENT_METHODS_LABELS,
    USER_ROLES,
    PAGINATION,
    CART_CONFIG,
    PRODUCT_CATEGORIES,
    PREPARATION_TIMES,
    RATING_RANGE,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION_RULES,
    FILE_CONFIG,
    ROUTES,
    TOAST_CONFIG,
    THEME_COLORS,
    STORAGE_KEYS,
    DATE_CONFIG,
    BUSINESS_HOURS,
    FEATURES,
    SOCIAL_MEDIA,
};
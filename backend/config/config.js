require('dotenv').config();

const config = {
    // Configuración del servidor
    port: process.env.PORT || 8083,

    // Configuración de la base de datos
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cali_pollo_delivery',
        port: process.env.DB_PORT || 3306,
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },

    // Configuración JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'cali_pollo_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // Configuración OAuth
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback'
        },
        facebook: {
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: '/auth/facebook/callback'
        }
    },

    // Configuración de archivos
    upload: {
        path: process.env.UPLOAD_PATH || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
    },

    // URLs
    urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
        backend: process.env.BACKEND_URL || 'http://localhost:8083'
    },

    // Configuración de email
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS
    },

    // Configuración de rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // máximo 100 requests por ventana de tiempo
        message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos'
    },

    // Configuración de sesiones
    session: {
        secret: process.env.SESSION_SECRET || 'cali_pollo_session_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        }
    },

    // Configuración del negocio
    business: {
        name: 'Cali Pollo Delivery',
        phone: process.env.RESTAURANT_PHONE || '+57 300 123 4567',
        address: process.env.RESTAURANT_ADDRESS || 'Carrera 10 #15-25, Sabanalarga, Atlántico',
        email: 'info@calipollo.com',
        deliveryTime: {
            default: 30, // minutos
            min: 15,
            max: 60
        },
        minOrderAmount: parseFloat(process.env.MIN_ORDER_AMOUNT) || 15000,
        deliveryFee: parseFloat(process.env.DELIVERY_FEE) || 3000,
        taxRate: parseFloat(process.env.TAX_RATE) || 0.19,
        currency: 'COP',
        operatingHours: {
            open: '10:00',
            close: '22:00',
            timezone: 'America/Bogota'
        }
    },

    // Configuración de seguridad
    security: {
        bcryptRounds: 12,
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000, // 15 minutos
        passwordMinLength: 6,
        cors: {
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                'http://localhost:3000'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }
    },

    // Configuración de logs
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log',
        maxSize: '10m',
        maxFiles: '5d'
    },

    // Estados de pedidos
    orderStatus: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        PREPARING: 'preparing',
        READY: 'ready',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    },

    // Estados de pago
    paymentStatus: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed'
    },

    // Métodos de pago disponibles
    paymentMethods: [
        'efectivo',
        'tarjeta_credito',
        'tarjeta_debito',
        'transferencia',
        'pse'
    ],

    // Configuración de notificaciones
    notifications: {
        enableEmail: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
        enableSMS: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@calipollo.com'
    }
};

// Validar configuraciones críticas
const validateConfig = () => {
    const required = [
        'database.host',
        'database.user',
        'database.database',
        'jwt.secret'
    ];

    for (const key of required) {
        const keys = key.split('.');
        let value = config;

        for (const k of keys) {
            value = value[k];
            if (value === undefined) {
                throw new Error(`Configuración requerida faltante: ${key}`);
            }
        }
    }
};

// Función para obtener configuración por clave
const get = (key, defaultValue = null) => {
    const keys = key.split('.');
    let value = config;

    for (const k of keys) {
        value = value[k];
        if (value === undefined) {
            return defaultValue;
        }
    }

    return value;
};

module.exports = {
    ...config,
    get,
    validateConfig
};
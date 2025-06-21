import { DATE_CONFIG, THEME_COLORS, BUSINESS_HOURS } from './constants.js';

// Formateo de moneda (Pesos colombianos)
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Formateo de números
export const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
};

// Formateo de fechas
export const formatDate = (date, includeTime = false) => {
    const dateObj = new Date(date);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Bogota',
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return dateObj.toLocaleDateString(DATE_CONFIG.LOCALE, options);
};

// Formateo de fecha relativa (hace X tiempo)
export const formatRelativeDate = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 31536000) return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `Hace ${Math.floor(diffInSeconds / 31536000)} años`;
};

// Validar email
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar teléfono colombiano
export const validatePhone = (phone) => {
    const phoneRegex = /^(\+57|57)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validar contraseña
export const validatePassword = (password) => {
    return {
        minLength: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        isValid: password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
    };
};

// Generar ID único
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Convertir texto a slug
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9 -]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .replace(/-+/g, '-') // Remover guiones múltiples
        .trim();
};

// Capitalizar primera letra
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Capitalizar cada palabra
export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.split(' ').map(word => capitalize(word)).join(' ');
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Calcular calificación promedio
export const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
};

// Obtener color de calificación
export const getRatingColor = (rating) => {
    if (rating >= 4.5) return THEME_COLORS.PRIMARY_YELLOW;
    if (rating >= 3.5) return THEME_COLORS.PRIMARY_ORANGE;
    if (rating >= 2.5) return THEME_COLORS.PRIMARY_RED;
    return THEME_COLORS.GRAY_MEDIUM;
};

// Calcular tiempo estimado de entrega
export const calculateDeliveryTime = (preparationTime = 20, deliveryDistance = 5) => {
    const baseDeliveryTime = Math.ceil(deliveryDistance / 2) * 5; // 5 min por cada 2km
    return preparationTime + baseDeliveryTime;
};

// Verificar si el restaurante está abierto
export const isRestaurantOpen = () => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const todayHours = BUSINESS_HOURS[dayOfWeek];
    if (!todayHours) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Obtener horario de hoy
export const getTodayHours = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return BUSINESS_HOURS[today] || null;
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Detectar dispositivo móvil
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Obtener coordenadas de geolocalización
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no soportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    });
};

// Copiar texto al portapapeles
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
};

// Validar formato de archivo
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

// Validar tamaño de archivo
export const validateFileSize = (file, maxSize) => {
    return file.size <= maxSize;
};

// Redimensionar imagen
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo proporción
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a blob
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(file);
    });
};

// Formatear precio con descuento
export const formatPriceWithDiscount = (originalPrice, discountPercent) => {
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;

    return {
        original: formatCurrency(originalPrice),
        discount: formatCurrency(discountAmount),
        final: formatCurrency(finalPrice),
        percentage: discountPercent,
    };
};

// Generar colores aleatorios para avatares
export const generateAvatarColor = (name) => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

// Obtener iniciales del nombre
export const getInitials = (name) => {
    if (!name) return 'U';

    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Calcular descuento
export const calculateDiscount = (originalPrice, discountPrice) => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

// Scroll suave a elemento
export const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// Scroll al top de la página
export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Limpiar datos de formulario
export const sanitizeFormData = (data) => {
    const sanitized = {};

    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
            sanitized[key] = data[key].trim();
        } else {
            sanitized[key] = data[key];
        }
    });

    return sanitized;
};

// Alias para compatibilidad con componentes existentes
export const formatPrice = formatCurrency;

export const getStoredUser = () => JSON.parse(localStorage.getItem('user'));
export const removeStoredUser = () => localStorage.removeItem('user');
export const storeUser = (user) => localStorage.setItem('user', JSON.stringify(user));

export default {
    formatCurrency,
    formatNumber,
    formatDate,
    formatRelativeDate,
    validateEmail,
    validatePhone,
    validatePassword,
    generateId,
    slugify,
    capitalize,
    capitalizeWords,
    truncateText,
    calculateAverageRating,
    getRatingColor,
    calculateDeliveryTime,
    isRestaurantOpen,
    getTodayHours,
    debounce,
    throttle,
    isMobile,
    getCurrentLocation,
    copyToClipboard,
    validateFileType,
    validateFileSize,
    resizeImage,
    formatPriceWithDiscount,
    generateAvatarColor,
    getInitials,
    calculateDiscount,
    scrollToElement,
    scrollToTop,
    sanitizeFormData,
};
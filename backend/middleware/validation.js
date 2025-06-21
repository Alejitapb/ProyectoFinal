const Joi = require('joi');

// Esquemas de validación
const schemas = {
    // Validación de registro
    register: Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'El nombre es requerido',
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 100 caracteres'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Debe ser un email válido',
            'string.empty': 'El email es requerido'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'string.empty': 'La contraseña es requerida'
        }),
        phone: Joi.string().pattern(/^[0-9+\-\s]+$/).min(10).max(20).optional().messages({
            'string.pattern.base': 'Número de teléfono inválido'
        }),
        address: Joi.string().max(500).optional()
    }),

    // Validación de login
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Debe ser un email válido',
            'string.empty': 'El email es requerido'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'La contraseña es requerida'
        })
    }),

    // Validación de producto
    product: Joi.object({
        name: Joi.string().min(2).max(200).required().messages({
            'string.empty': 'El nombre del producto es requerido',
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 200 caracteres'
        }),
        description: Joi.string().max(1000).optional(),
        price: Joi.number().positive().precision(2).required().messages({
            'number.positive': 'El precio debe ser mayor a 0',
            'any.required': 'El precio es requerido'
        }),
        category_id: Joi.number().integer().positive().required().messages({
            'number.positive': 'La categoría es requerida',
            'any.required': 'La categoría es requerida'
        }),
        image_url: Joi.string().uri().optional().messages({
            'string.uri': 'Debe ser una URL válida'
        }),
        ingredients: Joi.string().max(500).optional(),
        nutritional_info: Joi.string().max(500).optional(),
        preparation_time: Joi.number().integer().min(1).max(120).optional(),
        stock_quantity: Joi.number().integer().min(0).optional(),
        is_available: Joi.boolean().optional()
    }),

    // Validación de actualización de producto
    productUpdate: Joi.object({
        name: Joi.string().min(2).max(200).optional(),
        description: Joi.string().max(1000).optional(),
        price: Joi.number().positive().precision(2).optional(),
        category_id: Joi.number().integer().positive().optional(),
        image_url: Joi.string().uri().optional(),
        ingredients: Joi.string().max(500).optional(),
        nutritional_info: Joi.string().max(500).optional(),
        preparation_time: Joi.number().integer().min(1).max(120).optional(),
        stock_quantity: Joi.number().integer().min(0).optional(),
        is_available: Joi.boolean().optional()
    }),

    // Validación de pedido
    order: Joi.object({
        items: Joi.array().items(
            Joi.object({
                product_id: Joi.number().integer().positive().required(),
                quantity: Joi.number().integer().min(1).max(50).required(),
                special_requests: Joi.string().max(200).optional()
            })
        ).min(1).required().messages({
            'array.min': 'Debe incluir al menos un producto'
        }),
        delivery_address: Joi.string().min(10).max(500).required().messages({
            'string.empty': 'La dirección de entrega es requerida',
            'string.min': 'La dirección debe ser más específica'
        }),
        delivery_phone: Joi.string().pattern(/^[0-9+\-\s]+$/).min(10).max(20).required().messages({
            'string.pattern.base': 'Número de teléfono inválido',
            'string.empty': 'El teléfono de entrega es requerido'
        }),
        payment_method: Joi.string().valid('cash', 'card', 'transfer').required().messages({
            'any.only': 'Método de pago inválido'
        }),
        special_instructions: Joi.string().max(300).optional()
    }),

    // Validación de reseña
    review: Joi.object({
        product_id: Joi.number().integer().positive().required().messages({
            'any.required': 'El producto es requerido'
        }),
        order_id: Joi.number().integer().positive().optional(),
        rating: Joi.number().integer().min(1).max(5).required().messages({
            'number.min': 'La calificación debe ser entre 1 y 5',
            'number.max': 'La calificación debe ser entre 1 y 5',
            'any.required': 'La calificación es requerida'
        }),
        comment: Joi.string().min(10).max(500).optional().messages({
            'string.min': 'El comentario debe tener al menos 10 caracteres'
        })
    }),

    // Validación de actualización de reseña
    reviewUpdate: Joi.object({
        rating: Joi.number().integer().min(1).max(5).optional(),
        comment: Joi.string().min(10).max(500).optional()
    }),

    // Validación de categoría
    category: Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'El nombre de la categoría es requerido',
            'string.min': 'El nombre debe tener al menos 2 caracteres'
        }),
        description: Joi.string().max(300).optional(),
        image_url: Joi.string().uri().optional()
    }),

    // Validación de actualización de perfil
    profileUpdate: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().pattern(/^[0-9+\-\s]+$/).min(10).max(20).optional(),
        address: Joi.string().max(500).optional()
    }),

    // Validación de cambio de contraseña
    passwordChange: Joi.object({
        current_password: Joi.string().required().messages({
            'string.empty': 'La contraseña actual es requerida'
        }),
        new_password: Joi.string().min(6).required().messages({
            'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
            'string.empty': 'La nueva contraseña es requerida'
        }),
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
            'any.only': 'Las contraseñas no coinciden'
        })
    }),

    // Validación de ticket de soporte
    supportTicket: Joi.object({
        subject: Joi.string().min(5).max(200).required().messages({
            'string.empty': 'El asunto es requerido',
            'string.min': 'El asunto debe tener al menos 5 caracteres'
        }),
        description: Joi.string().min(20).max(1000).required().messages({
            'string.empty': 'La descripción es requerida',
            'string.min': 'La descripción debe tener al menos 20 caracteres'
        }),
        category: Joi.string().valid('technical', 'order', 'payment', 'general').optional(),
        priority: Joi.string().valid('low', 'medium', 'high').optional()
    })
};

// Función de validación genérica
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors
            });
        }

        next();
    };
};

// Middleware de validación específicos
const validateRegister = validate(schemas.register);
const validateLogin = validate(schemas.login);
const validateProduct = validate(schemas.product);
const validateProductUpdate = validate(schemas.productUpdate);
const validateOrder = validate(schemas.order);
const validateReview = validate(schemas.review);
const validateReviewUpdate = validate(schemas.reviewUpdate);
const validateCategory = validate(schemas.category);
const validateProfileUpdate = validate(schemas.profileUpdate);
const validatePasswordChange = validate(schemas.passwordChange);
const validateSupportTicket = validate(schemas.supportTicket);

// Validación de parámetros de URL
const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido'
        });
    }

    req.params.id = id;
    next();
};

// Validación de parámetros de consulta
const validateQueryParams = (req, res, next) => {
    const { page, limit, sort } = req.query;

    if (page && (isNaN(page) || parseInt(page) <= 0)) {
        return res.status(400).json({
            success: false,
            message: 'Número de página inválido'
        });
    }

    if (limit && (isNaN(limit) || parseInt(limit) <= 0 || parseInt(limit) > 100)) {
        return res.status(400).json({
            success: false,
            message: 'Límite inválido (debe ser entre 1 y 100)'
        });
    }

    if (sort && !['asc', 'desc'].includes(sort.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Orden inválido (debe ser asc o desc)'
        });
    }

    next();
};

// Validación de item del carrito
const validateCartItem = (req, res, next) => {
    const schema = Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).max(50).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

// Validación de filtros de productos
const validateProductFilters = (req, res, next) => {
    const { category, min_price, max_price, rating } = req.query;

    if (category && (isNaN(category) || parseInt(category) <= 0)) {
        return res.status(400).json({
            success: false,
            message: 'ID de categoría inválido'
        });
    }

    if (min_price && (isNaN(min_price) || parseFloat(min_price) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Precio mínimo inválido'
        });
    }

    if (max_price && (isNaN(max_price) || parseFloat(max_price) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Precio máximo inválido'
        });
    }

    if (rating && (isNaN(rating) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
        return res.status(400).json({
            success: false,
            message: 'Calificación inválida (debe ser entre 1 y 5)'
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateProduct,
    validateProductUpdate,
    validateOrder,
    validateReview,
    validateReviewUpdate,
    validateCategory,
    validateProfileUpdate,
    validatePasswordChange,
    validateSupportTicket,
    validateId,
    validateQueryParams,
    validateCartItem,
    validateProductFilters,
    validate,
    schemas
};
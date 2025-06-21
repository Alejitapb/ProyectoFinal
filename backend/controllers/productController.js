const { query } = require('../config/database');
const Joi = require('joi');

// Esquemas de validación
const productSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().positive().required(),
    category_id: Joi.number().integer().positive().required(),
    image_url: Joi.string().uri().optional(),
    ingredients: Joi.string().max(1000).optional(),
    nutritional_info: Joi.string().max(1000).optional(),
    preparation_time: Joi.number().integer().min(1).max(120).default(15),
    stock_quantity: Joi.number().integer().min(0).default(0)
});

const categorySchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    image_url: Joi.string().uri().optional()
});

// Obtener todos los productos con filtros
const getProducts = async (req, res) => {
    try {
        const {
            category_id,
            search,
            min_price,
            max_price,
            available_only = 'false',
            sort_by = 'name',
            sort_order = 'ASC',
            page = 1,
            limit = 20
        } = req.query;

        let whereConditions = ['p.is_available = TRUE'];
        let queryParams = [];

        // Filtros
        if (category_id) {
            whereConditions.push('p.category_id = ?');
            queryParams.push(category_id);
        }

        if (search) {
            whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.ingredients LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        if (min_price) {
            whereConditions.push('p.price >= ?');
            queryParams.push(parseFloat(min_price));
        }

        if (max_price) {
            whereConditions.push('p.price <= ?');
            queryParams.push(parseFloat(max_price));
        }

        if (available_only === 'true') {
            whereConditions.push('p.stock_quantity > 0');
        }

        // Ordenamiento
        const validSortFields = ['name', 'price', 'rating', 'created_at'];
        const sortField = validSortFields.includes(sort_by) ? `p.${sort_by}` : 'p.name';
        const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Paginación
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

        queryParams.push(parseInt(limit), offset);

        const products = await query(sql, queryParams);

        // Contar total de productos para paginación
        const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${whereConditions.join(' AND ')}
    `;

        const countResult = await query(countSql, queryParams.slice(0, -2));
        const total = countResult[0].total;

        res.json({
            products,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const products = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_available = TRUE
    `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Obtener reseñas del producto
        const reviews = await query(`
      SELECT 
        r.*,
        u.name as user_name,
        u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

        const product = {
            ...products[0],
            reviews
        };

        res.json({ product });

    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener productos destacados/populares
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await query(`
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = TRUE AND p.stock_quantity > 0
      ORDER BY p.rating DESC, p.total_reviews DESC
      LIMIT ?
    `, [parseInt(limit)]);

        res.json({ products });

    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener categorías
const getCategories = async (req, res) => {
    try {
        const categories = await query(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_available = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.name
    `);

        res.json({ categories });

    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear producto (solo admin)
const createProduct = async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const {
            name,
            description,
            price,
            category_id,
            image_url,
            ingredients,
            nutritional_info,
            preparation_time,
            stock_quantity
        } = value;

        // Verificar que la categoría existe
        const categories = await query('SELECT id FROM categories WHERE id = ? AND is_active = TRUE', [category_id]);
        if (categories.length === 0) {
            return res.status(400).json({ error: 'Categoría no válida' });
        }

        const result = await query(`
      INSERT INTO products (
        name, description, price, category_id, image_url, 
        ingredients, nutritional_info, preparation_time, stock_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            name,
            description,
            price,
            category_id,
            image_url,
            ingredients,
            nutritional_info,
            preparation_time,
            stock_quantity
        ]);

        const newProducts = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            product: newProducts[0]
        });

    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar producto (solo admin)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar datos (campos opcionales para actualización)
        const updateSchema = productSchema.fork(Object.keys(productSchema.describe().keys), (schema) => schema.optional());
        const { error, value } = updateSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Verificar que el producto existe
        const existingProducts = await query('SELECT id FROM products WHERE id = ?', [id]);
        if (existingProducts.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Construir consulta de actualización dinámicamente
        const updates = [];
        const values = [];

        Object.keys(value).forEach(key => {
            if (value[key] !== undefined) {
                updates.push(`${key} = ?`);
                values.push(value[key]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        values.push(id);

        await query(
            `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        const updatedProducts = await query('SELECT * FROM products WHERE id = ?', [id]);

        res.json({
            message: 'Producto actualizado exitosamente',
            product: updatedProducts[0]
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar producto (solo admin)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('UPDATE products SET is_available = FALSE WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado exitosamente' });

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear categoría (solo admin)
const createCategory = async (req, res) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, description, image_url } = value;

        const result = await query(
            'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
            [name, description, image_url]
        );

        const newCategories = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            category: newCategories[0]
        });

    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory
};
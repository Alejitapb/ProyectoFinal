const db = require('../config/database');

class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = parseFloat(data.price);
        this.category_id = data.category_id;
        this.category_name = data.category_name;
        this.image_url = data.image_url;
        this.ingredients = data.ingredients;
        this.nutritional_info = data.nutritional_info;
        this.preparation_time = data.preparation_time || 15;
        this.is_available = data.is_available !== undefined ? data.is_available : true;
        this.stock_quantity = data.stock_quantity || 0;
        this.rating = parseFloat(data.rating) || 0.0;
        this.total_reviews = parseInt(data.total_reviews) || 0;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Crear nuevo producto
    static async create(productData) {
        try {
            const {
                name, description, price, category_id, image_url,
                ingredients, nutritional_info, preparation_time,
                is_available, stock_quantity
            } = productData;

            const query = `
        INSERT INTO products (
          name, description, price, category_id, image_url,
          ingredients, nutritional_info, preparation_time,
          is_available, stock_quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [result] = await db.execute(query, [
                name, description, price, category_id, image_url,
                ingredients, nutritional_info, preparation_time || 15,
                is_available !== undefined ? is_available : true,
                stock_quantity || 0
            ]);

            return await Product.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Buscar producto por ID
    static async findById(id) {
        try {
            const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
      `;

            const [rows] = await db.execute(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            return new Product(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los productos con filtros
    static async getAll(filters = {}) {
        try {
            let query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE 1=1
      `;
            const values = [];

            // Filtro por categoría
            if (filters.category_id) {
                query += ' AND p.category_id = ?';
                values.push(filters.category_id);
            }

            // Filtro por disponibilidad
            if (filters.is_available !== undefined) {
                query += ' AND p.is_available = ?';
                values.push(filters.is_available);
            }

            // Filtro por búsqueda de texto
            if (filters.search) {
                query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.ingredients LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                values.push(searchTerm, searchTerm, searchTerm);
            }

            // Filtro por rango de precios
            if (filters.min_price) {
                query += ' AND p.price >= ?';
                values.push(parseFloat(filters.min_price));
            }

            if (filters.max_price) {
                query += ' AND p.price <= ?';
                values.push(parseFloat(filters.max_price));
            }

            // Filtro por rating mínimo
            if (filters.min_rating) {
                query += ' AND p.rating >= ?';
                values.push(parseFloat(filters.min_rating));
            }

            // Ordenamiento
            const validSortFields = ['name', 'price', 'rating', 'created_at', 'preparation_time'];
            const sortBy = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
            const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

            query += ` ORDER BY p.${sortBy} ${sortOrder}`;

            // Paginación
            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));

                if (filters.offset) {
                    query += ' OFFSET ?';
                    values.push(parseInt(filters.offset));
                }
            }

            const [rows] = await db.execute(query, values);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener productos por categoría
    static async getByCategory(categoryId, limit = null) {
        try {
            let query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.category_id = ? AND p.is_available = TRUE
        ORDER BY p.rating DESC, p.name ASC
      `;
            const values = [categoryId];

            if (limit) {
                query += ' LIMIT ?';
                values.push(parseInt(limit));
            }

            const [rows] = await db.execute(query, values);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener productos destacados (mejor rating)
    static async getFeatured(limit = 8) {
        try {
            const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_available = TRUE AND p.rating >= 4.0
        ORDER BY p.rating DESC, p.total_reviews DESC
        LIMIT ?
      `;

            const [rows] = await db.execute(query, [limit]);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw error;
        }
    }

    // Actualizar producto
    async update(updateData) {
        try {
            const allowedFields = [
                'name', 'description', 'price', 'category_id', 'image_url',
                'ingredients', 'nutritional_info', 'preparation_time',
                'is_available', 'stock_quantity'
            ];

            const updateFields = [];
            const values = [];

            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    values.push(updateData[field]);
                }
            }

            if (updateFields.length === 0) {
                return this;
            }

            values.push(this.id);
            const query = `
        UPDATE products 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

            await db.execute(query, values);
            return await Product.findById(this.id);
        } catch (error) {
            throw error;
        }
    }

    // Actualizar stock
    async updateStock(quantity, operation = 'set') {
        try {
            let query;
            let newQuantity;

            switch (operation) {
                case 'add':
                    query = 'UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
                    newQuantity = this.stock_quantity + quantity;
                    break;
                case 'subtract':
                    query = 'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?';
                    newQuantity = Math.max(0, this.stock_quantity - quantity);
                    break;
                default: // 'set'
                    query = 'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
                    newQuantity = quantity;
            }

            await db.execute(query, [quantity, this.id]);
            this.stock_quantity = newQuantity;

            return this;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar rating
    async updateRating() {
        try {
            const query = `
        UPDATE products p 
        SET 
          p.rating = (
            SELECT COALESCE(AVG(r.rating), 0) 
            FROM reviews r 
            WHERE r.product_id = p.id AND r.is_approved = TRUE
          ),
          p.total_reviews = (
            SELECT COUNT(*) 
            FROM reviews r 
            WHERE r.product_id = p.id AND r.is_approved = TRUE
          ),
          p.updated_at = CURRENT_TIMESTAMP
        WHERE p.id = ?
      `;

            await db.execute(query, [this.id]);

            // Actualizar los valores en el objeto actual
            const updated = await Product.findById(this.id);
            this.rating = updated.rating;
            this.total_reviews = updated.total_reviews;

            return this;
        } catch (error) {
            throw error;
        }
    }

    // Verificar disponibilidad
    isAvailable() {
        return this.is_available && this.stock_quantity > 0;
    }

    // Verificar si hay suficiente stock
    hasStock(quantity = 1) {
        return this.stock_quantity >= quantity;
    }

    // Eliminar producto (soft delete)
    async delete() {
        try {
            const query = 'UPDATE products SET is_available = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await db.execute(query, [this.id]);
            this.is_available = false;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas del producto
    async getStats() {
        try {
            const queries = {
                totalOrders: `
          SELECT COUNT(DISTINCT oi.order_id) as count 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.id 
          WHERE oi.product_id = ? AND o.status IN ('delivered', 'confirmed')
        `,
                totalQuantityOrdered: `
          SELECT COALESCE(SUM(oi.quantity), 0) as total 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.id 
          WHERE oi.product_id = ? AND o.status IN ('delivered', 'confirmed')
        `,
                totalRevenue: `
          SELECT COALESCE(SUM(oi.total_price), 0) as total 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.id 
          WHERE oi.product_id = ? AND o.status IN ('delivered', 'confirmed')
        `,
                averageOrderQuantity: `
          SELECT COALESCE(AVG(oi.quantity), 0) as average 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.id 
          WHERE oi.product_id = ? AND o.status IN ('delivered', 'confirmed')
        `
            };

            const stats = {};

            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await db.execute(query, [this.id]);
                stats[key] = rows[0].count || rows[0].total || rows[0].average || 0;
            }

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Buscar productos similares
    async getSimilarProducts(limit = 4) {
        try {
            const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.category_id = ? AND p.id != ? AND p.is_available = TRUE
        ORDER BY p.rating DESC, p.total_reviews DESC
        LIMIT ?
      `;

            const [rows] = await db.execute(query, [this.category_id, this.id, limit]);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw error;
        }
    }

    // Método para JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            category_id: this.category_id,
            category_name: this.category_name,
            image_url: this.image_url,
            ingredients: this.ingredients,
            nutritional_info: this.nutritional_info,
            preparation_time: this.preparation_time,
            is_available: this.is_available,
            stock_quantity: this.stock_quantity,
            rating: this.rating,
            total_reviews: this.total_reviews,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Product;
const db = require('../config/database');

class Category {
    // Obtener todas las categorías activas
    static async findAll() {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener categoría por ID
    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Crear nueva categoría
    static async create(categoryData) {
        try {
            const { name, description, image_url } = categoryData;
            const [result] = await db.execute(
                'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
                [name, description, image_url]
            );

            return this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Actualizar categoría
    static async update(id, categoryData) {
        try {
            const { name, description, image_url, is_active } = categoryData;

            await db.execute(
                'UPDATE categories SET name = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?',
                [name, description, image_url, is_active, id]
            );

            return this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar categoría (soft delete)
    static async delete(id) {
        try {
            await db.execute(
                'UPDATE categories SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Obtener productos por categoría
    static async getProductsByCategory(categoryId) {
        try {
            const [rows] = await db.execute(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        JOIN categories c ON p.category_id = c.id 
        WHERE p.category_id = ? AND p.is_available = TRUE AND c.is_active = TRUE
        ORDER BY p.name
      `, [categoryId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Contar productos por categoría
    static async getProductCount(categoryId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_available = TRUE',
                [categoryId]
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Buscar categorías por nombre
    static async searchByName(searchTerm) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM categories WHERE name LIKE ? AND is_active = TRUE ORDER BY name',
                [`%${searchTerm}%`]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de categorías para admin
    static async getStats() {
        try {
            const [rows] = await db.execute(`
        SELECT 
          c.id,
          c.name,
          c.is_active,
          COUNT(p.id) as total_products,
          COUNT(CASE WHEN p.is_available = TRUE THEN 1 END) as available_products,
          AVG(p.rating) as avg_rating,
          SUM(p.total_reviews) as total_reviews
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name, c.is_active
        ORDER BY c.name
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category;
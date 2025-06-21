const db = require('../config/database');

class Review {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.product_id = data.product_id;
        this.order_id = data.order_id;
        this.rating = parseInt(data.rating);
        this.comment = data.comment;
        this.is_approved = data.is_approved !== undefined ? data.is_approved : false;
        this.created_at = data.created_at;

        // Datos adicionales que pueden venir de joins
        this.user_name = data.user_name;
        this.user_avatar = data.user_avatar;
        this.product_name = data.product_name;
        this.product_image = data.product_image;
    }

    // Crear nueva reseña
    static async create(reviewData) {
        try {
            const { user_id, product_id, order_id, rating, comment } = reviewData;

            // Verificar que la calificación esté en el rango válido
            if (rating < 1 || rating > 5) {
                throw new Error('La calificación debe estar entre 1 y 5');
            }

            // Verificar que el usuario haya comprado el producto (si se proporciona order_id)
            if (order_id) {
                const [orderCheck] = await db.execute(`
          SELECT COUNT(*) as count
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered', 'confirmed')
        `, [order_id, user_id, product_id]);

                if (orderCheck[0].count === 0) {
                    throw new Error('Solo puedes reseñar productos que has comprado');
                }
            }

            // Verificar que el usuario no haya reseñado ya este producto
            const [existingReview] = await db.execute(
                'SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND product_id = ?',
                [user_id, product_id]
            );

            if (existingReview[0].count > 0) {
                throw new Error('Ya has reseñado este producto');
            }

            const query = `
        INSERT INTO reviews (user_id, product_id, order_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `;

            const [result] = await db.execute(query, [
                user_id, product_id, order_id, rating, comment
            ]);

            // Actualizar el rating del producto
            await Review.updateProductRating(product_id);

            return await Review.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Buscar reseña por ID
    static async findById(id) {
        try {
            const query = `
        SELECT r.*, u.name as user_name, u.avatar_url as user_avatar,
               p.name as product_name, p.image_url as product_image
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.id = ?
      `;

            const [rows] = await db.execute(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            return new Review(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las reseñas con filtros
    static async getAll(filters = {}) {
        try {
            let query = `
        SELECT r.*, u.name as user_name, u.avatar_url as user_avatar,
               p.name as product_name, p.image_url as product_image
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE 1=1
      `;
            const values = [];

            // Filtro por producto
            if (filters.product_id) {
                query += ' AND r.product_id = ?';
                values.push(filters.product_id);
            }

            // Filtro por usuario
            if (filters.user_id) {
                query += ' AND r.user_id = ?';
                values.push(filters.user_id);
            }

            // Filtro por calificación
            if (filters.rating) {
                query += ' AND r.rating = ?';
                values.push(filters.rating);
            }

            if (filters.min_rating) {
                query += ' AND r.rating >= ?';
                values.push(filters.min_rating);
            }

            // Filtro por estado de aprobación
            if (filters.is_approved !== undefined) {
                query += ' AND r.is_approved = ?';
                values.push(filters.is_approved);
            }

            // Filtro por búsqueda en comentarios
            if (filters.search) {
                query += ' AND (r.comment LIKE ? OR p.name LIKE ? OR u.name LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                values.push(searchTerm, searchTerm, searchTerm);
            }

            // Filtro por fechas
            if (filters.date_from) {
                query += ' AND DATE(r.created_at) >= ?';
                values.push(filters.date_from);
            }

            if (filters.date_to) {
                query += ' AND DATE(r.created_at) <= ?';
                values.push(filters.date_to);
            }

            // Ordenamiento
            const validSortFields = ['created_at', 'rating'];
            const sortBy = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
            const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

            query += ` ORDER BY r.${sortBy} ${sortOrder}`;

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
            return rows.map(row => new Review(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener reseñas por producto
    static async getByProduct(productId, filters = {}) {
        try {
            let query = `
        SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ? AND r.is_approved = TRUE
      `;
            const values = [productId];

            // Filtro por calificación
            if (filters.rating) {
                query += ' AND r.rating = ?';
                values.push(filters.rating);
            }

            // Ordenamiento
            const sortBy = filters.sort_by === 'rating' ? 'rating' : 'created_at';
            const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
            query += ` ORDER BY r.${sortBy} ${sortOrder}`;

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
            return rows.map(row => new Review(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener reseñas por usuario
    static async getByUser(userId, filters = {}) {
        try {
            let query = `
        SELECT r.*, p.name as product_name, p.image_url as product_image
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ?
      `;
            const values = [userId];

            if (filters.product_id) {
                query += ' AND r.product_id = ?';
                values.push(filters.product_id);
            }

            query += ' ORDER BY r.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
            }

            const [rows] = await db.execute(query, values);
            return rows.map(row => new Review(row));
        } catch (error) {
            throw error;
        }
    }

    // Aprobar reseña
    async approve() {
        try {
            const query = 'UPDATE reviews SET is_approved = TRUE WHERE id = ?';
            await db.execute(query, [this.id]);

            this.is_approved = true;

            // Actualizar el rating del producto
            await Review.updateProductRating(this.product_id);

            return this;
        } catch (error) {
            throw error;
        }
    }

    // Rechazar reseña
    async reject() {
        try {
            const query = 'UPDATE reviews SET is_approved = FALSE WHERE id = ?';
            await db.execute(query, [this.id]);

            this.is_approved = false;

            // Actualizar el rating del producto
            await Review.updateProductRating(this.product_id);

            return this;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar reseña
    async update(updateData) {
        try {
            const allowedFields = ['rating', 'comment'];
            const updateFields = [];
            const values = [];

            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    if (field === 'rating') {
                        const rating = parseInt(updateData[field]);
                        if (rating < 1 || rating > 5) {
                            throw new Error('La calificación debe estar entre 1 y 5');
                        }
                        updateFields.push(`${field} = ?`);
                        values.push(rating);
                    } else {
                        updateFields.push(`${field} = ?`);
                        values.push(updateData[field]);
                    }
                }
            }

            if (updateFields.length === 0) {
                return this;
            }

            // Resetear aprobación si se modifica el contenido
            updateFields.push('is_approved = FALSE');
            values.push(this.id);

            const query = `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`;
            await db.execute(query, values);

            // Actualizar el rating del producto
            await Review.updateProductRating(this.product_id);

            return await Review.findById(this.id);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar reseña
    async delete() {
        try {
            const query = 'DELETE FROM reviews WHERE id = ?';
            await db.execute(query, [this.id]);

            // Actualizar el rating del producto
            await Review.updateProductRating(this.product_id);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar rating del producto
    static async updateProductRating(productId) {
        try {
            const query = `
        UPDATE products 
        SET 
          rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE product_id = ? AND is_approved = TRUE
          ),
          total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = ? AND is_approved = TRUE
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

            await db.execute(query, [productId, productId, productId]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de reseñas
    static async getStats(filters = {}) {
        try {
            let baseQuery = 'FROM reviews r WHERE 1=1';
            const values = [];

            if (filters.product_id) {
                baseQuery += ' AND r.product_id = ?';
                values.push(filters.product_id);
            }

            if (filters.date_from) {
                baseQuery += ' AND DATE(r.created_at) >= ?';
                values.push(filters.date_from);
            }

            if (filters.date_to) {
                baseQuery += ' AND DATE(r.created_at) <= ?';
                values.push(filters.date_to);
            }

            const queries = {
                totalReviews: `SELECT COUNT(*) as count ${baseQuery}`,
                approvedReviews: `SELECT COUNT(*) as count ${baseQuery} AND r.is_approved = TRUE`,
                pendingReviews: `SELECT COUNT(*) as count ${baseQuery} AND r.is_approved = FALSE`,
                averageRating: `SELECT COALESCE(AVG(r.rating), 0) as average ${baseQuery} AND r.is_approved = TRUE`
            };

            const stats = {};

            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await db.execute(query, values);
                stats[key] = rows[0].count || rows[0].average || 0;
            }

            // Distribución por calificación
            const ratingQuery = `
        SELECT r.rating, COUNT(*) as count 
        ${baseQuery} AND r.is_approved = TRUE
        GROUP BY r.rating 
        ORDER BY r.rating DESC
      `;
            const [ratingRows] = await db.execute(ratingQuery, values);
            stats.ratingDistribution = ratingRows;

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Obtener reseñas recientes
    static async getRecent(limit = 10, approved_only = true) {
        try {
            let query = `
        SELECT r.*, u.name as user_name, u.avatar_url as user_avatar,
               p.name as product_name, p.image_url as product_image
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE 1=1
      `;

            if (approved_only) {
                query += ' AND r.is_approved = TRUE';
            }

            query += ' ORDER BY r.created_at DESC LIMIT ?';

            const [rows] = await db.execute(query, [limit]);
            return rows.map(row => new Review(row));
        } catch (error) {
            throw error;
        }
    }

    // Verificar si un usuario puede reseñar un producto
    static async canUserReview(userId, productId) {
        try {
            // Verificar si ya existe una reseña
            const [existingReview] = await db.execute(
                'SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            if (existingReview[0].count > 0) {
                return { canReview: false, reason: 'Ya has reseñado este producto' };
            }

            // Verificar si ha comprado el producto
            const [purchaseCheck] = await db.execute(`
        SELECT COUNT(*) as count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered', 'confirmed')
      `, [userId, productId]);

            if (purchaseCheck[0].count === 0) {
                return { canReview: false, reason: 'Solo puedes reseñar productos que has comprado' };
            }

            return { canReview: true };
        } catch (error) {
            throw error;
        }
    }

    // Método para JSON
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            product_id: this.product_id,
            order_id: this.order_id,
            rating: this.rating,
            comment: this.comment,
            is_approved: this.is_approved,
            created_at: this.created_at,
            user_name: this.user_name,
            user_avatar: this.user_avatar,
            product_name: this.product_name,
            product_image: this.product_image
        };
    }
}

module.exports = Review;
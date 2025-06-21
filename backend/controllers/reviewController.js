const db = require('../config/database');

const reviewController = {
    // Crear nueva reseña
    createReview: async (req, res) => {
        try {
            const { product_id, order_id, rating, comment } = req.body;
            const user_id = req.user.id;

            // Validar que el usuario haya comprado el producto
            if (order_id) {
                const [orderExists] = await db.execute(
                    `SELECT oi.id FROM order_items oi 
           JOIN orders o ON oi.order_id = o.id 
           WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'`,
                    [order_id, user_id, product_id]
                );

                if (orderExists.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Solo puedes reseñar productos que hayas pedido'
                    });
                }

                // Verificar si ya reseñó este producto en este pedido
                const [existingReview] = await db.execute(
                    'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?',
                    [user_id, product_id, order_id]
                );

                if (existingReview.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya has reseñado este producto'
                    });
                }
            }

            // Crear la reseña
            const [result] = await db.execute(
                'INSERT INTO reviews (user_id, product_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                [user_id, product_id, order_id || null, rating, comment]
            );

            // Actualizar rating promedio del producto
            await updateProductRating(product_id);

            res.status(201).json({
                success: true,
                message: 'Reseña creada exitosamente',
                data: {
                    id: result.insertId,
                    user_id,
                    product_id,
                    order_id,
                    rating,
                    comment
                }
            });
        } catch (error) {
            console.error('Error creating review:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Obtener reseñas de un producto
    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const [reviews] = await db.execute(
                `SELECT r.*, u.name as user_name, u.avatar_url
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ? AND r.is_approved = true
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
                [productId, limit, offset]
            );

            // Contar total de reseñas
            const [countResult] = await db.execute(
                'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = true',
                [productId]
            );

            // Obtener estadísticas de ratings
            const [statsResult] = await db.execute(
                `SELECT 
          AVG(rating) as average_rating,
          COUNT(*) as total_reviews,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
         FROM reviews 
         WHERE product_id = ? AND is_approved = true`,
                [productId]
            );

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page,
                        limit,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    },
                    stats: statsResult[0]
                }
            });
        } catch (error) {
            console.error('Error getting product reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Obtener reseñas del usuario
    getUserReviews: async (req, res) => {
        try {
            const user_id = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const [reviews] = await db.execute(
                `SELECT r.*, p.name as product_name, p.image_url as product_image
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
                [user_id, limit, offset]
            );

            const [countResult] = await db.execute(
                'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
                [user_id]
            );

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page,
                        limit,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error getting user reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Actualizar reseña
    updateReview: async (req, res) => {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const user_id = req.user.id;

            // Verificar que la reseña pertenece al usuario
            const [review] = await db.execute(
                'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
                [id, user_id]
            );

            if (review.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reseña no encontrada'
                });
            }

            // Actualizar reseña
            await db.execute(
                'UPDATE reviews SET rating = ?, comment = ?, is_approved = false WHERE id = ?',
                [rating, comment, id]
            );

            // Actualizar rating promedio del producto
            await updateProductRating(review[0].product_id);

            res.json({
                success: true,
                message: 'Reseña actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error updating review:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Eliminar reseña
    deleteReview: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            // Verificar que la reseña pertenece al usuario
            const [review] = await db.execute(
                'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
                [id, user_id]
            );

            if (review.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reseña no encontrada'
                });
            }

            // Eliminar reseña
            await db.execute('DELETE FROM reviews WHERE id = ?', [id]);

            // Actualizar rating promedio del producto
            await updateProductRating(review[0].product_id);

            res.json({
                success: true,
                message: 'Reseña eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Obtener productos que el usuario puede reseñar
    getReviewableProducts: async (req, res) => {
        try {
            const user_id = req.user.id;

            const [products] = await db.execute(
                `SELECT DISTINCT p.id, p.name, p.image_url, oi.order_id
         FROM products p
         JOIN order_items oi ON p.id = oi.product_id
         JOIN orders o ON oi.order_id = o.id
         LEFT JOIN reviews r ON (r.product_id = p.id AND r.user_id = ? AND r.order_id = o.id)
         WHERE o.user_id = ? AND o.status = 'delivered' AND r.id IS NULL
         ORDER BY o.created_at DESC`,
                [user_id, user_id]
            );

            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error getting reviewable products:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};

// Función auxiliar para actualizar el rating promedio de un producto
async function updateProductRating(productId) {
    try {
        const [result] = await db.execute(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
       FROM reviews 
       WHERE product_id = ? AND is_approved = true`,
            [productId]
        );

        const avgRating = result[0].avg_rating || 0;
        const totalReviews = result[0].total_reviews || 0;

        await db.execute(
            'UPDATE products SET rating = ?, total_reviews = ? WHERE id = ?',
            [parseFloat(avgRating).toFixed(2), totalReviews, productId]
        );
    } catch (error) {
        console.error('Error updating product rating:', error);
    }
}

module.exports = reviewController;
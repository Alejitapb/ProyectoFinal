const db = require('../config/database');

const adminController = {
    // Dashboard - Estadísticas generales
    getDashboardStats: async (req, res) => {
        try {
            // Estadísticas de hoy
            const today = new Date().toISOString().split('T')[0];

            // Pedidos de hoy
            const [todayOrders] = await db.execute(
                'SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM orders WHERE DATE(created_at) = ?',
                [today]
            );

            // Pedidos pendientes
            const [pendingOrders] = await db.execute(
                'SELECT COUNT(*) as count FROM orders WHERE status IN ("pending", "confirmed", "preparing")'
            );

            // Total de usuarios
            const [totalUsers] = await db.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "customer"'
            );

            // Productos más vendidos (últimos 30 días)
            const [topProducts] = await db.execute(
                `SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as revenue
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY p.id, p.name
         ORDER BY total_sold DESC
         LIMIT 5`
            );

            // Ventas por día (últimos 7 días)
            const [dailySales] = await db.execute(
                `SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(total_amount) as revenue
         FROM orders 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND status != 'cancelled'
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
            );

            // Reseñas recientes
            const [recentReviews] = await db.execute(
                `SELECT r.*, u.name as user_name, p.name as product_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN products p ON r.product_id = p.id
         WHERE r.is_approved = false
         ORDER BY r.created_at DESC
         LIMIT 5`
            );

            res.json({
                success: true,
                data: {
                    todayStats: {
                        orders: todayOrders[0].count || 0,
                        revenue: todayOrders[0].revenue || 0
                    },
                    pendingOrders: pendingOrders[0].count || 0,
                    totalUsers: totalUsers[0].count || 0,
                    topProducts,
                    dailySales,
                    recentReviews
                }
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Gestión de productos
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';
            const category = req.query.category || '';

            let query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
            let params = [];

            if (search) {
                query += ' AND p.name LIKE ?';
                params.push(`%${search}%`);
            }

            if (category) {
                query += ' AND p.category_id = ?';
                params.push(category);
            }

            query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [products] = await db.execute(query, params);

            // Contar total
            let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
            let countParams = [];

            if (search) {
                countQuery += ' AND p.name LIKE ?';
                countParams.push(`%${search}%`);
            }

            if (category) {
                countQuery += ' AND p.category_id = ?';
                countParams.push(category);
            }

            const [countResult] = await db.execute(countQuery, countParams);

            res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page,
                        limit,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error getting all products:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Gestión de pedidos
    getAllOrders: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;
            const status = req.query.status || '';
            const startDate = req.query.startDate || '';
            const endDate = req.query.endDate || '';

            let query = `
        SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
            let params = [];

            if (status) {
                query += ' AND o.status = ?';
                params.push(status);
            }

            if (startDate) {
                query += ' AND DATE(o.created_at) >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND DATE(o.created_at) <= ?';
                params.push(endDate);
            }

            query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [orders] = await db.execute(query, params);

            // Obtener items de cada pedido
            for (let order of orders) {
                const [items] = await db.execute(
                    `SELECT oi.*, p.name as product_name
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
                    [order.id]
                );
                order.items = items;
            }

            // Contar total
            let countQuery = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1';
            let countParams = [];

            if (status) {
                countQuery += ' AND o.status = ?';
                countParams.push(status);
            }

            if (startDate) {
                countQuery += ' AND DATE(o.created_at) >= ?';
                countParams.push(startDate);
            }

            if (endDate) {
                countQuery += ' AND DATE(o.created_at) <= ?';
                countParams.push(endDate);
            }

            const [countResult] = await db.execute(countQuery, countParams);

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        page,
                        limit,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error getting all orders:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Actualizar estado de pedido
    updateOrderStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status, estimated_delivery_time } = req.body;

            const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado de pedido inválido'
                });
            }

            let updateQuery = 'UPDATE orders SET status = ?';
            let params = [status];

            if (estimated_delivery_time) {
                updateQuery += ', estimated_delivery_time = ?';
                params.push(estimated_delivery_time);
            }

            updateQuery += ' WHERE id = ?';
            params.push(orderId);

            const [result] = await db.execute(updateQuery, params);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Estado del pedido actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Gestión de reseñas
    getAllReviews: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;
            const status = req.query.status || 'all'; // all, approved, pending

            let query = `
        SELECT r.*, u.name as user_name, p.name as product_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
      `;
            let params = [];

            if (status === 'approved') {
                query += ' WHERE r.is_approved = true';
            } else if (status === 'pending') {
                query += ' WHERE r.is_approved = false';
            }

            query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [reviews] = await db.execute(query, params);

            // Contar total
            let countQuery = 'SELECT COUNT(*) as total FROM reviews r';
            let countParams = [];

            if (status === 'approved') {
                countQuery += ' WHERE r.is_approved = true';
            } else if (status === 'pending') {
                countQuery += ' WHERE r.is_approved = false';
            }

            const [countResult] = await db.execute(countQuery, countParams);

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
            console.error('Error getting all reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Aprobar/rechazar reseña
    updateReviewStatus: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { is_approved } = req.body;

            const [result] = await db.execute(
                'UPDATE reviews SET is_approved = ? WHERE id = ?',
                [is_approved, reviewId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reseña no encontrada'
                });
            }

            res.json({
                success: true,
                message: is_approved ? 'Reseña aprobada' : 'Reseña rechazada'
            });
        } catch (error) {
            console.error('Error updating review status:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Gestión de usuarios
    getAllUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';

            let query = `
        SELECT id, name, email, phone, address, role, is_active, created_at,
               (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders,
               (SELECT SUM(total_amount) FROM orders WHERE user_id = users.id AND status = 'delivered') as total_spent
        FROM users
        WHERE role = 'customer'
      `;
            let params = [];

            if (search) {
                query += ' AND (name LIKE ? OR email LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [users] = await db.execute(query, params);

            // Contar total
            let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = "customer"';
            let countParams = [];

            if (search) {
                countQuery += ' AND (name LIKE ? OR email LIKE ?)';
                countParams.push(`%${search}%`, `%${search}%`);
            }

            const [countResult] = await db.execute(countQuery, countParams);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page,
                        limit,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Reportes de ventas
    getSalesReport: async (req, res) => {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;

            let dateFormat;
            switch (groupBy) {
                case 'month':
                    dateFormat = '%Y-%m';
                    break;
                case 'year':
                    dateFormat = '%Y';
                    break;
                default:
                    dateFormat = '%Y-%m-%d';
            }

            let query = `
        SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COUNT(*) as orders,
          SUM(total_amount) as revenue,
          AVG(total_amount) as avg_order_value
        FROM orders
        WHERE status = 'delivered'
      `;
            let params = [dateFormat];

            if (startDate) {
                query += ' AND DATE(created_at) >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND DATE(created_at) <= ?';
                params.push(endDate);
            }

            query += ' GROUP BY period ORDER BY period ASC';

            const [salesData] = await db.execute(query, params);

            res.json({
                success: true,
                data: salesData
            });
        } catch (error) {
            console.error('Error getting sales report:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Configuración del sistema
    getSystemConfig: async (req, res) => {
        try {
            const [config] = await db.execute('SELECT * FROM system_config ORDER BY config_key');

            const configObj = {};
            config.forEach(item => {
                configObj[item.config_key] = item.config_value;
            });

            res.json({
                success: true,
                data: configObj
            });
        } catch (error) {
            console.error('Error getting system config:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Actualizar configuración del sistema
    updateSystemConfig: async (req, res) => {
        try {
            const updates = req.body;

            for (const [key, value] of Object.entries(updates)) {
                await db.execute(
                    'UPDATE system_config SET config_value = ? WHERE config_key = ?',
                    [value, key]
                );
            }

            res.json({
                success: true,
                message: 'Configuración actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error updating system config:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};

module.exports = adminController;
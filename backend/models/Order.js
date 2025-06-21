const db = require('../config/database');

class Order {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.order_number = data.order_number;
        this.status = data.status || 'pending';
        this.total_amount = parseFloat(data.total_amount);
        this.delivery_address = data.delivery_address;
        this.delivery_phone = data.delivery_phone;
        this.payment_method = data.payment_method;
        this.payment_status = data.payment_status || 'pending';
        this.estimated_delivery_time = data.estimated_delivery_time;
        this.special_instructions = data.special_instructions;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;

        // Datos adicionales que pueden venir de joins
        this.user_name = data.user_name;
        this.user_email = data.user_email;
        this.items = data.items || [];
    }

    // Generar número de orden único
    static generateOrderNumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `ORD-${timestamp}-${random}`.toUpperCase();
    }

    // Crear nueva orden
    static async create(orderData, items) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const {
                user_id, delivery_address, delivery_phone, payment_method,
                special_instructions, estimated_delivery_time
            } = orderData;

            // Calcular total
            let total_amount = 0;
            const orderItems = [];

            for (const item of items) {
                // Verificar que el producto existe y está disponible
                const [productRows] = await connection.execute(
                    'SELECT * FROM products WHERE id = ? AND is_available = TRUE',
                    [item.product_id]
                );

                if (productRows.length === 0) {
                    throw new Error(`Producto con ID ${item.product_id} no está disponible`);
                }

                const product = productRows[0];

                // Verificar stock
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock_quantity}`);
                }

                const item_total = parseFloat(product.price) * parseInt(item.quantity);
                total_amount += item_total;

                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: product.price,
                    total_price: item_total,
                    special_requests: item.special_requests || null
                });
            }

            // Crear la orden
            const order_number = Order.generateOrderNumber();
            const orderQuery = `
        INSERT INTO orders (
          user_id, order_number, total_amount, delivery_address, 
          delivery_phone, payment_method, special_instructions, 
          estimated_delivery_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [orderResult] = await connection.execute(orderQuery, [
                user_id, order_number, total_amount, delivery_address,
                delivery_phone, payment_method, special_instructions,
                estimated_delivery_time
            ]);

            const order_id = orderResult.insertId;

            // Crear los items de la orden
            for (const item of orderItems) {
                const itemQuery = `
          INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, total_price, special_requests
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;

                await connection.execute(itemQuery, [
                    order_id, item.product_id, item.quantity,
                    item.unit_price, item.total_price, item.special_requests
                ]);

                // Actualizar stock del producto
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            await connection.commit();
            return await Order.findById(order_id);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Buscar orden por ID
    static async findById(id) {
        try {
            const query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `;

            const [rows] = await db.execute(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            const order = new Order(rows[0]);
            order.items = await order.getItems();
            return order;
        } catch (error) {
            throw error;
        }
    }

    // Buscar orden por número de orden
    static async findByOrderNumber(orderNumber) {
        try {
            const query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.order_number = ?
      `;

            const [rows] = await db.execute(query, [orderNumber]);

            if (rows.length === 0) {
                return null;
            }

            const order = new Order(rows[0]);
            order.items = await order.getItems();
            return order;
        } catch (error) {
            throw error;
        }
    }

    // Obtener órdenes con filtros
    static async getAll(filters = {}) {
        try {
            let query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
            const values = [];

            // Filtro por usuario
            if (filters.user_id) {
                query += ' AND o.user_id = ?';
                values.push(filters.user_id);
            }

            // Filtro por estado
            if (filters.status) {
                query += ' AND o.status = ?';
                values.push(filters.status);
            }

            // Filtro por estado de pago
            if (filters.payment_status) {
                query += ' AND o.payment_status = ?';
                values.push(filters.payment_status);
            }

            // Filtro por fechas
            if (filters.date_from) {
                query += ' AND DATE(o.created_at) >= ?';
                values.push(filters.date_from);
            }

            if (filters.date_to) {
                query += ' AND DATE(o.created_at) <= ?';
                values.push(filters.date_to);
            }

            // Filtro por búsqueda
            if (filters.search) {
                query += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                values.push(searchTerm, searchTerm, searchTerm);
            }

            // Ordenamiento
            const validSortFields = ['created_at', 'total_amount', 'status'];
            const sortBy = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
            const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

            query += ` ORDER BY o.${sortBy} ${sortOrder}`;

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

            // Obtener items para cada orden si se solicita
            const orders = [];
            for (const row of rows) {
                const order = new Order(row);
                if (filters.include_items) {
                    order.items = await order.getItems();
                }
                orders.push(order);
            }

            return orders;
        } catch (error) {
            throw error;
        }
    }

    // Obtener items de la orden
    async getItems() {
        try {
            const query = `
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id
      `;

            const [rows] = await db.execute(query, [this.id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar estado de la orden
    async updateStatus(newStatus, adminId = null) {
        try {
            const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

            if (!validStatuses.includes(newStatus)) {
                throw new Error('Estado de orden inválido');
            }

            // Si se cancela la orden, restaurar stock
            if (newStatus === 'cancelled' && this.status !== 'cancelled') {
                await this.restoreStock();
            }

            const query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await db.execute(query, [newStatus, this.id]);

            this.status = newStatus;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar estado de pago
    async updatePaymentStatus(paymentStatus) {
        try {
            const validStatuses = ['pending', 'paid', 'failed'];

            if (!validStatuses.includes(paymentStatus)) {
                throw new Error('Estado de pago inválido');
            }

            const query = 'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await db.execute(query, [paymentStatus, this.id]);

            this.payment_status = paymentStatus;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Restaurar stock de productos (cuando se cancela una orden)
    async restoreStock() {
        try {
            const items = await this.getItems();

            for (const item of items) {
                await db.execute(
                    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        } catch (error) {
            throw error;
        }
    }

    // Calcular tiempo estimado de entrega
    static calculateEstimatedDeliveryTime(preparationMinutes = 30) {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + (preparationMinutes * 60000));
        return deliveryTime;
    }

    // Verificar si la orden puede ser cancelada
    canBeCancelled() {
        const cancelableStatuses = ['pending', 'confirmed'];
        return cancelableStatuses.includes(this.status);
    }

    // Verificar si la orden puede ser modificada
    canBeModified() {
        return this.status === 'pending';
    }

    // Obtener estadísticas de órdenes
    static async getStats(filters = {}) {
        try {
            let baseQuery = 'FROM orders o WHERE 1=1';
            const values = [];

            // Aplicar filtros de fecha si existen
            if (filters.date_from) {
                baseQuery += ' AND DATE(o.created_at) >= ?';
                values.push(filters.date_from);
            }

            if (filters.date_to) {
                baseQuery += ' AND DATE(o.created_at) <= ?';
                values.push(filters.date_to);
            }

            const queries = {
                totalOrders: `SELECT COUNT(*) as count ${baseQuery}`,
                totalRevenue: `SELECT COALESCE(SUM(o.total_amount), 0) as total ${baseQuery} AND o.status IN ('delivered', 'confirmed')`,
                averageOrderValue: `SELECT COALESCE(AVG(o.total_amount), 0) as average ${baseQuery} AND o.status IN ('delivered', 'confirmed')`,
                pendingOrders: `SELECT COUNT(*) as count ${baseQuery} AND o.status = 'pending'`,
                completedOrders: `SELECT COUNT(*) as count ${baseQuery} AND o.status = 'delivered'`,
                cancelledOrders: `SELECT COUNT(*) as count ${baseQuery} AND o.status = 'cancelled'`
            };

            const stats = {};

            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await db.execute(query, values);
                stats[key] = rows[0].count || rows[0].total || rows[0].average || 0;
            }

            // Obtener estadísticas por estado
            const statusQuery = `
        SELECT status, COUNT(*) as count 
        ${baseQuery} 
        GROUP BY status
      `;
            const [statusRows] = await db.execute(statusQuery, values);
            stats.ordersByStatus = statusRows;

            // Obtener estadísticas por método de pago
            const paymentQuery = `
        SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total_amount 
        ${baseQuery} AND o.status IN ('delivered', 'confirmed')
        GROUP BY payment_method
      `;
            const [paymentRows] = await db.execute(paymentQuery, values);
            stats.ordersByPaymentMethod = paymentRows;

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Obtener órdenes recientes
    static async getRecent(limit = 10) {
        try {
            const query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT ?
      `;

            const [rows] = await db.execute(query, [limit]);
            return rows.map(row => new Order(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener órdenes por usuario
    static async getByUser(userId, filters = {}) {
        try {
            let query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.user_id = ?
      `;
            const values = [userId];

            if (filters.status) {
                query += ' AND o.status = ?';
                values.push(filters.status);
            }

            if (filters.date_from) {
                query += ' AND DATE(o.created_at) >= ?';
                values.push(filters.date_from);
            }

            if (filters.date_to) {
                query += ' AND DATE(o.created_at) <= ?';
                values.push(filters.date_to);
            }

            query += ' ORDER BY o.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
            }

            const [rows] = await db.execute(query, values);

            const orders = [];
            for (const row of rows) {
                const order = new Order(row);
                if (filters.include_items) {
                    order.items = await order.getItems();
                }
                orders.push(order);
            }

            return orders;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar dirección de entrega
    async updateDeliveryInfo(deliveryAddress, deliveryPhone) {
        try {
            if (!this.canBeModified()) {
                throw new Error('No se puede modificar la información de entrega en este estado');
            }

            const query = `
        UPDATE orders 
        SET delivery_address = ?, delivery_phone = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

            await db.execute(query, [deliveryAddress, deliveryPhone, this.id]);

            this.delivery_address = deliveryAddress;
            this.delivery_phone = deliveryPhone;

            return this;
        } catch (error) {
            throw error;
        }
    }

    // Método para JSON
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            order_number: this.order_number,
            status: this.status,
            total_amount: this.total_amount,
            delivery_address: this.delivery_address,
            delivery_phone: this.delivery_phone,
            payment_method: this.payment_method,
            payment_status: this.payment_status,
            estimated_delivery_time: this.estimated_delivery_time,
            special_instructions: this.special_instructions,
            created_at: this.created_at,
            updated_at: this.updated_at,
            user_name: this.user_name,
            user_email: this.user_email,
            items: this.items
        };
    }
}

module.exports = Order;
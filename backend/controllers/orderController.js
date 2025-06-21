const { query, transaction } = require('../config/database');
const Joi = require('joi');

// Esquemas de validación
const orderItemSchema = Joi.object({
    product_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
    special_requests: Joi.string().max(500).optional()
});

const createOrderSchema = Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
    delivery_address: Joi.string().min(10).max(500).required(),
    delivery_phone: Joi.string().pattern(/^[+]?[\d\s\-()]{10,20}$/).required(),
    payment_method: Joi.string().valid('cash', 'credit_card', 'debit_card', 'transfer').required(),
    special_instructions: Joi.string().max(500).optional()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled').required()
});

// Generar número de orden único
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CP${timestamp.slice(-6)}${random}`;
};

// Crear pedido
const createOrder = async (req, res) => {
    try {
        const { error, value } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { items, delivery_address, delivery_phone, payment_method, special_instructions } = value;
        const userId = req.user.id;

        // Usar transacción para asegurar consistencia
        const result = await transaction(async (connection) => {
            // Verificar productos y calcular total
            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
                const [products] = await connection.execute(
                    'SELECT id, name, price, stock_quantity, is_available FROM products WHERE id = ? AND is_available = TRUE',
                    [item.product_id]
                );

                if (products.length === 0) {
                    throw new Error(`Producto con ID ${item.product_id} no encontrado o no disponible`);
                }

                const product = products[0];

                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock_quantity}`);
                }

                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: item.quantity,
                    unit_price: product.price,
                    total_price: itemTotal,
                    special_requests: item.special_requests || null
                });
            }

            // Obtener configuración del sistema
            const [configs] = await connection.execute(
                'SELECT config_key, config_value FROM system_config WHERE config_key IN (?, ?)',
                ['min_order_amount', 'delivery_fee']
            );

            const config = {};
            configs.forEach(c => {
                config[c.config_key] = parseFloat(c.config_value);
            });

            const minOrderAmount = config.min_order_amount || 15000;
            const deliveryFee = config.delivery_fee || 3000;

            if (totalAmount < minOrderAmount) {
                throw new Error(`El monto mínimo de pedido es $${minOrderAmount.toLocaleString()}`);
            }

            // Agregar costo de domicilio
            totalAmount += deliveryFee;

            // Crear orden
            const orderNumber = generateOrderNumber();
            const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

            const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          user_id, order_number, total_amount, delivery_address, 
          delivery_phone, payment_method, special_instructions, estimated_delivery_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                userId, orderNumber, totalAmount, delivery_address,
                delivery_phone, payment_method, special_instructions, estimatedDeliveryTime
            ]);

            const orderId = orderResult.insertId;

            // Crear items del pedido y actualizar stock
            for (const item of orderItems) {
                await connection.execute(`
          INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, total_price, special_requests
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
                    orderId, item.product_id, item.quantity,
                    item.unit_price, item.total_price, item.special_requests
                ]);

                // Actualizar stock
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            return { orderId, orderNumber, totalAmount, deliveryFee };
        });

        // Obtener orden completa para respuesta
        const orders = await query(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [result.orderId]);

        const orderItems = await query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.image_url as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [result.orderId]);

        const orderData = {
            ...orders[0],
            items: orderItems,
            delivery_fee: result.deliveryFee
        };

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            order: orderData
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(400).json({ error: error.message || 'Error interno del servidor' });
    }
};

// Obtener pedidos del usuario
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        let whereCondition = 'o.user_id = ?';
        let queryParams = [userId];

        if (status) {
            whereCondition += ' AND o.status = ?';
            queryParams.push(status);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const orders = await query(`
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${whereCondition}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

        // Obtener items para cada orden
        for (let order of orders) {
            const items = await query(`
        SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

            order.items = items;
        }

        res.json({ orders });

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener pedido por ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        let whereCondition = 'o.id = ?';
        let queryParams = [id];

        if (!isAdmin) {
            whereCondition += ' AND o.user_id = ?';
            queryParams.push(userId);
        }

        const orders = await query(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE ${whereCondition}
    `, queryParams);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const orderItems = await query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.image_url as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

        const orderData = {
            ...orders[0],
            items: orderItems
        };

        res.json({ order: orderData });

    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar estado del pedido (solo admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateOrderStatusSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { status } = value;

        // Verificar que el pedido existe
        const orders = await query('SELECT id, status FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const currentStatus = orders[0].status;

        // Validar transiciones de estado
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready', 'cancelled'],
            'ready': ['delivered'],
            'delivered': [],
            'cancelled': []
        };

        if (!validTransitions[currentStatus].includes(status)) {
            return res.status(400).json({
                error: `No se puede cambiar de estado "${currentStatus}" a "${status}"`
            });
        }

        // Actualizar estado
        await query(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        // Si se cancela el pedido, restaurar stock
        if (status === 'cancelled' && currentStatus !== 'cancelled') {
            const orderItems = await query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of orderItems) {
                await query(
                    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }

        res.json({
            message: 'Estado del pedido actualizado exitosamente',
            status
        });

    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener todos los pedidos (solo admin)
const getAllOrders = async (req, res) => {
    try {
        const {
            status,
            date_from,
            date_to,
            customer_search,
            page = 1,
            limit = 20
        } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('o.status = ?');
            queryParams.push(status);
        }

        if (date_from) {
            whereConditions.push('DATE(o.created_at) >= ?');
            queryParams.push(date_from);
        }

        if (date_to) {
            whereConditions.push('DATE(o.created_at) <= ?');
            queryParams.push(date_to);
        }

        if (customer_search) {
            whereConditions.push('(u.name LIKE ? OR u.email LIKE ? OR o.order_number LIKE ?)');
            const searchTerm = `%${customer_search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const orders = await query(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

        // Contar total para paginación
        const countResult = await query(`
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, queryParams);

        const total = countResult[0].total;

        res.json({
            orders,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error al obtener todos los pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Cancelar pedido (usuario)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verificar que el pedido pertenece al usuario y puede ser cancelado
        const orders = await query(
            'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const order = orders[0];
        const cancellableStatuses = ['pending', 'confirmed'];

        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                error: 'El pedido no puede ser cancelado en su estado actual'
            });
        }

        // Cancelar pedido y restaurar stock
        await transaction(async (connection) => {
            await connection.execute(
                'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['cancelled', id]
            );

            // Restaurar stock
            const [orderItems] = await connection.execute(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of orderItems) {
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        });

        res.json({ message: 'Pedido cancelado exitosamente' });

    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
    cancelOrder
};
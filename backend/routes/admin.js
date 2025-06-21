const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware para todas las rutas de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Gestión de productos
router.get('/products', adminController.getAllProducts);

// Gestión de pedidos
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Gestión de reseñas
router.get('/reviews', adminController.getAllReviews);
router.put('/reviews/:reviewId/status', adminController.updateReviewStatus);

// Gestión de usuarios
router.get('/users', adminController.getAllUsers);

// Reportes
router.get('/reports/sales', adminController.getSalesReport);

// Configuración del sistema
router.get('/config', adminController.getSystemConfig);
router.put('/config', adminController.updateSystemConfig);

module.exports = router;
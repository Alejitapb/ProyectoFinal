const express = require('express');
const {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Rutas de administrador (requieren autenticación y permisos de admin)
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

// Rutas de categorías para administrador
router.post('/categories', authenticateToken, requireAdmin, createCategory);

module.exports = router;
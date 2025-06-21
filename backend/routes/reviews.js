const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { validateReview, validateReviewUpdate } = require('../middleware/validation');

// Crear nueva reseña (requiere autenticación)
router.post('/', authenticateToken, validateReview, reviewController.createReview);

// Obtener reseñas de un producto (público)
router.get('/product/:productId', reviewController.getProductReviews);

// Obtener reseñas del usuario (requiere autenticación)
router.get('/user', authenticateToken, reviewController.getUserReviews);

// Obtener productos que el usuario puede reseñar (requiere autenticación)
router.get('/reviewable', authenticateToken, reviewController.getReviewableProducts);

// Actualizar reseña (requiere autenticación)
router.put('/:id', authenticateToken, validateReviewUpdate, reviewController.updateReview);

// Eliminar reseña (requiere autenticación)
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
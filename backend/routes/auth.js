const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
} = require('../controllers/authController');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// Rutas de autenticación tradicional
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

// Rutas OAuth - Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
    async (req, res) => {
        try {
            // Generar token JWT para el usuario autenticado
            const token = generateToken(req.user.id);

            // Redirigir al frontend con el token
            res.redirect(`${process.env.FRONTEND_URL}/oauth/success?token=${token}`);
        } catch (error) {
            console.error('Error en callback de Google:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback`);
        }
    }
);

// Rutas OAuth - Facebook
router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
    async (req, res) => {
        try {
            // Generar token JWT para el usuario autenticado
            const token = generateToken(req.user.id);

            // Redirigir al frontend con el token
            res.redirect(`${process.env.FRONTEND_URL}/oauth/success?token=${token}`);
        } catch (error) {
            console.error('Error en callback de Facebook:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback`);
        }
    }
);

// Ruta para verificar token
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// Ruta para obtener información de OAuth providers disponibles
router.get('/oauth/providers', (req, res) => {
    const providers = [];

    if (process.env.GOOGLE_CLIENT_ID) {
        providers.push({
            name: 'google',
            displayName: 'Google',
            authUrl: '/api/auth/google'
        });
    }

    if (process.env.FACEBOOK_APP_ID) {
        providers.push({
            name: 'facebook',
            displayName: 'Facebook',
            authUrl: '/api/auth/facebook'
        });
    }

    res.json({ providers });
});

module.exports = router;
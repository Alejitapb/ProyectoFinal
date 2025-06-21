const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const Joi = require('joi');

// Esquemas de validación
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]{10,20}$/).optional(),
    address: Joi.string().max(500).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]{10,20}$/).optional(),
    address: Joi.string().max(500).optional()
});

// Registrar usuario
const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password, phone, address } = value;

        // Verificar si el usuario ya existe
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const result = await query(
            `INSERT INTO users (name, email, password, phone, address, role, is_active) 
       VALUES (?, ?, ?, ?, ?, 'customer', TRUE)`,
            [name, email, hashedPassword, phone || null, address || null]
        );

        // Generar token
        const token = generateToken(result.insertId);

        // Obtener datos del usuario creado
        const newUsers = await query(
            'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: newUsers[0]
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Iniciar sesión
const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        // Buscar usuario
        const users = await query(
            'SELECT id, name, email, password, phone, address, role, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({ error: 'Cuenta desactivada' });
        }

        // Verificar contraseña solo si el usuario no es OAuth
        if (user.password) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        } else {
            return res.status(401).json({
                error: 'Esta cuenta fue creada con OAuth. Usa Google o Facebook para iniciar sesión.'
            });
        }

        // Generar token
        const token = generateToken(user.id);

        // Remover contraseña de la respuesta
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener perfil del usuario
const getProfile = async (req, res) => {
    try {
        const users = await query(
            `SELECT id, name, email, phone, address, role, avatar_url, oauth_provider, 
              created_at, updated_at FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user: users[0] });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
    try {
        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, phone, address } = value;
        const userId = req.user.id;

        // Construir consulta dinámicamente
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            values.push(address);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        values.push(userId);

        await query(
            `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        // Obtener usuario actualizado
        const updatedUsers = await query(
            `SELECT id, name, email, phone, address, role, avatar_url, oauth_provider, 
              created_at, updated_at FROM users WHERE id = ?`,
            [userId]
        );

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: updatedUsers[0]
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        const userId = req.user.id;

        // Obtener contraseña actual
        const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user.password) {
            return res.status(400).json({
                error: 'Esta cuenta fue creada con OAuth. No se puede cambiar la contraseña.'
            });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Encriptar nueva contraseña
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await query(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Logout (opcional, principalmente para limpiar sesiones OAuth)
const logout = async (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            }
        });
    }

    res.json({ message: 'Sesión cerrada exitosamente' });
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
};
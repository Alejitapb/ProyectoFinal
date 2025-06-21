const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.phone = data.phone;
        this.address = data.address;
        this.role = data.role || 'customer';
        this.oauth_provider = data.oauth_provider;
        this.oauth_id = data.oauth_id;
        this.avatar_url = data.avatar_url;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Crear nuevo usuario
    static async create(userData) {
        try {
            const { name, email, password, phone, address, role, oauth_provider, oauth_id, avatar_url } = userData;

            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            const query = `
        INSERT INTO users (name, email, password, phone, address, role, oauth_provider, oauth_id, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [result] = await db.execute(query, [
                name, email, hashedPassword, phone, address, role || 'customer',
                oauth_provider, oauth_id, avatar_url
            ]);

            return await User.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
            const [rows] = await db.execute(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            return new User(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
            const [rows] = await db.execute(query, [email]);

            if (rows.length === 0) {
                return null;
            }

            return new User(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por OAuth
    static async findByOAuth(provider, oauth_id) {
        try {
            const query = 'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ? AND is_active = TRUE';
            const [rows] = await db.execute(query, [provider, oauth_id]);

            if (rows.length === 0) {
                return null;
            }

            return new User(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    // Verificar contraseña
    async comparePassword(password) {
        if (!this.password) {
            return false;
        }
        return await bcrypt.compare(password, this.password);
    }

    // Actualizar usuario
    async update(updateData) {
        try {
            const allowedFields = ['name', 'phone', 'address', 'avatar_url'];
            const updateFields = [];
            const values = [];

            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    values.push(updateData[field]);
                }
            }

            if (updateData.password) {
                const hashedPassword = await bcrypt.hash(updateData.password, 10);
                updateFields.push('password = ?');
                values.push(hashedPassword);
            }

            if (updateFields.length === 0) {
                return this;
            }

            values.push(this.id);
            const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

            await db.execute(query, values);

            return await User.findById(this.id);
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los usuarios (solo admin)
    static async getAll(filters = {}) {
        try {
            let query = 'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE 1=1';
            const values = [];

            if (filters.role) {
                query += ' AND role = ?';
                values.push(filters.role);
            }

            if (filters.is_active !== undefined) {
                query += ' AND is_active = ?';
                values.push(filters.is_active);
            }

            if (filters.search) {
                query += ' AND (name LIKE ? OR email LIKE ?)';
                values.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            query += ' ORDER BY created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
            }

            const [rows] = await db.execute(query, values);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Desactivar usuario
    async deactivate() {
        try {
            const query = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await db.execute(query, [this.id]);
            this.is_active = false;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Activar usuario
    async activate() {
        try {
            const query = 'UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await db.execute(query, [this.id]);
            this.is_active = true;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de usuario
    async getStats() {
        try {
            const queries = {
                totalOrders: 'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
                totalSpent: 'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status IN ("delivered", "confirmed")',
                averageOrderValue: 'SELECT COALESCE(AVG(total_amount), 0) as average FROM orders WHERE user_id = ? AND status IN ("delivered", "confirmed")',
                totalReviews: 'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?'
            };

            const stats = {};

            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await db.execute(query, [this.id]);
                stats[key] = rows[0].count || rows[0].total || rows[0].average || 0;
            }

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Método para JSON (excluir contraseña)
    toJSON() {
        const user = { ...this };
        delete user.password;
        return user;
    }
}

module.exports = User;
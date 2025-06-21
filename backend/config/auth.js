const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { query } = require('./database');
require('dotenv').config();

// Serialización de usuario para sesiones
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const users = await query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length > 0) {
            done(null, users[0]);
        } else {
            done(null, false);
        }
    } catch (error) {
        done(error, null);
    }
});

// Estrategia de Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8083'}/api/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Buscar usuario existente
                const existingUsers = await query(
                    'SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = ?',
                    [profile.id, 'google']
                );

                if (existingUsers.length > 0) {
                    return done(null, existingUsers[0]);
                }

                // Verificar si ya existe un usuario con el mismo email
                const emailUsers = await query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);

                if (emailUsers.length > 0) {
                    // Actualizar usuario existente con datos de OAuth
                    await query(
                        'UPDATE users SET oauth_provider = ?, oauth_id = ?, avatar_url = ? WHERE email = ?',
                        ['google', profile.id, profile.photos[0].value, profile.emails[0].value]
                    );

                    const updatedUsers = await query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
                    return done(null, updatedUsers[0]);
                }

                // Crear nuevo usuario
                const result = await query(
                    `INSERT INTO users (name, email, oauth_provider, oauth_id, avatar_url, is_active) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        profile.displayName,
                        profile.emails[0].value,
                        'google',
                        profile.id,
                        profile.photos[0].value,
                        true
                    ]
                );

                const newUsers = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
                done(null, newUsers[0]);

            } catch (error) {
                console.error('Error en autenticación Google:', error);
                done(error, null);
            }
        }));
}

// Estrategia de Facebook OAuth
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8083'}/api/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Buscar usuario existente
                const existingUsers = await query(
                    'SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = ?',
                    [profile.id, 'facebook']
                );

                if (existingUsers.length > 0) {
                    return done(null, existingUsers[0]);
                }

                // Verificar si ya existe un usuario con el mismo email
                const email = profile.emails ? profile.emails[0].value : null;
                let existingEmailUser = null;

                if (email) {
                    const emailUsers = await query('SELECT * FROM users WHERE email = ?', [email]);
                    if (emailUsers.length > 0) {
                        existingEmailUser = emailUsers[0];
                    }
                }

                if (existingEmailUser) {
                    // Actualizar usuario existente con datos de OAuth
                    await query(
                        'UPDATE users SET oauth_provider = ?, oauth_id = ?, avatar_url = ? WHERE email = ?',
                        ['facebook', profile.id, profile.photos[0].value, email]
                    );

                    const updatedUsers = await query('SELECT * FROM users WHERE email = ?', [email]);
                    return done(null, updatedUsers[0]);
                }

                // Crear nuevo usuario
                const result = await query(
                    `INSERT INTO users (name, email, oauth_provider, oauth_id, avatar_url, is_active) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        profile.displayName,
                        email || `facebook_${profile.id}@calipollo.com`,
                        'facebook',
                        profile.id,
                        profile.photos[0].value,
                        true
                    ]
                );

                const newUsers = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
                done(null, newUsers[0]);

            } catch (error) {
                console.error('Error en autenticación Facebook:', error);
                done(error, null);
            }
        }));
}

module.exports = passport;
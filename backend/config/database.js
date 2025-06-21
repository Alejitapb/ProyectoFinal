const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1123435814Ale.',
    database: process.env.DB_NAME || 'cali_pollo_delivery',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        console.log(`📊 Base de datos: ${dbConfig.database}`);
        console.log(`🖥️  Host: ${dbConfig.host}:${dbConfig.port}`);
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        console.error('🔧 Verifica tu configuración en el archivo .env');
        process.exit(1);
    }
};

// Función helper para ejecutar consultas
const query = async (sql, params = []) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en consulta SQL:', error);
        throw error;
    }
};

// Función helper para transacciones
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Inicializar conexión
testConnection();

module.exports = {
    pool,
    query,
    transaction
};
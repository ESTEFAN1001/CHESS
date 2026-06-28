const { Pool } = require('pg');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
}

console.log('Configuration Database:', {
    user: dbConfig.user,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database
})

const pool = new Pool(dbConfig);

// TEST CONNECTION
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conexion to database:', err);
        return;
    } else {
        console.log('Database connected');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
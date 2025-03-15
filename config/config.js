require('dotenv').config()

const dbConnectionAttributes = {
    dialect: 'mysql',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialectOptions: {
        charset: 'utf8mb4',
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
}

module.exports = {
    development: dbConnectionAttributes,
    test: dbConnectionAttributes,
    production: dbConnectionAttributes,
}

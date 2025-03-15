require('dotenv').config()

const dbConnectionAttributes = {
    dialect: process.env.DB_CONNECTION,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
}

module.exports = {
    development: dbConnectionAttributes,
    test: dbConnectionAttributes,
    production: dbConnectionAttributes,
}

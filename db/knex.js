const fp = require('fastify-plugin')
const Knex = require('knex')
const config = require('./knexfile')

async function dbConnector(fastify, options) {
    const knex = Knex(config)
    fastify.decorate('knex', knex)
}

module.exports = fp(dbConnector)

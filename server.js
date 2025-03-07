/**
 * External dependencies
 */
const dotenv = require('dotenv')
const Fastify = require('fastify')
const fastifyFormbody = require('@fastify/formbody')

/**
 * Internal dependencies
 */
const v1 = require('./routes/v1/')

dotenv.config()

const fastify = new Fastify({
    logger: true,
})

fastify.register(fastifyFormbody)
fastify.register(v1, { prefix: '/api/v1/' })

const start = async () => {
    const PORT = process.env.APP_PORT || 3000
    try {
        await fastify.listen({ port: PORT })
        console.log(`Server is running on port ${PORT}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()

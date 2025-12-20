/**
 * External dependencies
 */
require('module-alias/register')
const dotenv = require('dotenv')
const Fastify = require('fastify')
const fastifyFormbody = require('@fastify/formbody')
const fastifyMultipart = require('@fastify/multipart')
const jwt = require('@fastify/jwt')
const fastitySocketIo = require('fastify-socket.io')
const cors = require('@fastify/cors')

/**
 * Internal dependencies
 */
const v1 = require('./routes/v1/')

dotenv.config()

const fastify = new Fastify({
    logger: true,
    ajv: {
        customOptions: {
            removeAdditional: 'all',
        },
    },
})

fastify.register(cors, {
    origin: '*',
})

fastify.register(fastitySocketIo, {
    cors: {
        origin: '*',
    },
    preClose: (done) => {
        // do other things
        fastify.io.local.disconnectSockets(true)
        done()
    },
})

fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
})

fastify.removeContentTypeParser('multipart/form-data')
fastify.register(fastifyMultipart, {
    limits: {
        fileSize: 3 * 1024 * 1024, // ✅ Max field size: 3MB
        files: 1, // ✅ Max 5 files at a time
    },
})
fastify.register(fastifyFormbody)
fastify.register(v1, { prefix: '/api/v1/' })

const start = async () => {
    const PORT = process.env.APP_PORT || 3000
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' })
        console.log(`Server is running on port ${PORT}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()

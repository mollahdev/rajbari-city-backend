const dotenv = require('dotenv')
const Fastify = require('fastify')

dotenv.config()
const fastify = new Fastify({
    logger: true,
})

fastify.get('/', async (req, reply) => {
    return {
        data: 'hello world',
    }
})

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

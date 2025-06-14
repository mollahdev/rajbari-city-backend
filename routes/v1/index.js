const socketConnection = require('@/socket')
const authRoutes = require('./auth')
const profileRoutes = require('./profile')
const fileRoutes = require('./file')
const appRoutes = require('./app')
const bloodRoutes = require('./blood')
const categoryRoutes = require('./category')
const serviceRoutes = require('./service')

module.exports = async (fastify) => {
    /**
     * client routes
     */
    fastify.register(authRoutes, { prefix: '/auth' })
    fastify.register(profileRoutes, { prefix: '/profile' })
    fastify.register(bloodRoutes, { prefix: '/blood' })
    fastify.register(fileRoutes, { prefix: '/file' })
    fastify.register(appRoutes, { prefix: '/app' })
    fastify.register(categoryRoutes, { prefix: '/category' })
    fastify.register(serviceRoutes, { prefix: '/service' })
    /**
     * socket connection
     */
    socketConnection(fastify)
}

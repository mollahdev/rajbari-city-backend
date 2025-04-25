const authRoutes = require('./auth')
const profileRoutes = require('./profile')
const fileRoutes = require('./file')
const appRoutes = require('./app')
const bloodRoutes = require('./blood')

module.exports = async (fastify) => {
    /**
     * client routes
     */
    fastify.register(authRoutes, { prefix: '/auth' })
    fastify.register(profileRoutes, { prefix: '/profile' })
    fastify.register(bloodRoutes, { prefix: '/blood' })
    fastify.register(fileRoutes, { prefix: '/file' })
    fastify.register(appRoutes, { prefix: '/app' })
}

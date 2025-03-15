const authRoutes = require('./auth')
const profileRoutes = require('./profile')
const fileRoutes = require('./file')
const bloodRoutes = require('./blood')
const appRoutes = require('./app')

module.exports = async (fastify) => {
    /**
     * client routes
     */
    fastify.register(authRoutes, { prefix: '/auth' })
    fastify.register(profileRoutes, { prefix: '/profile' })
    fastify.register(fileRoutes, { prefix: '/file' })
    fastify.register(bloodRoutes, { prefix: '/blood' })
    fastify.register(appRoutes, { prefix: '/app' })
}

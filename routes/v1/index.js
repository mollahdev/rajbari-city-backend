const authRoutes = require('./auth')
const profileRoutes = require('./profile')
const fileRoutes = require('./file')

module.exports = async (fastify) => {
    /**
     * client routes
     */
    fastify.register(authRoutes, { prefix: '/auth' })
    fastify.register(profileRoutes, { prefix: '/profile' })
    fastify.register(fileRoutes, { prefix: '/file' })
}

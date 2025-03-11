const UserController = require('../../app/controllers/UserController')

const DirectoryTypeController = require('../../app/controllers/DirectoryTypeController')
const CategoryController = require('../../app/controllers/CategoryController')
const ListingController = require('../../app/controllers/ListingController')
const auth = require('../../app/middleware/auth')

const authRoutes = require('./client/auth')

module.exports = async (fastify) => {
    /**
     * client routes
     */
    fastify.register(authRoutes, { prefix: '/auth' })

    fastify.register(
        async (routes) => {
            routes.get('/', DirectoryTypeController.index)
            routes.addHook('onRequest', auth) //Middleware
        },
        { prefix: '/directory-types' }
    )

    fastify.register(
        async (routes) => {
            routes.get('/', CategoryController.index)
            routes.addHook('onRequest', auth) //Middleware
        },
        { prefix: '/categories' }
    )

    fastify.register(
        async (routes) => {
            routes.get('/', ListingController.index)
            routes.addHook('onRequest', auth) //Middleware
        },
        { prefix: '/listings' }
    )

    fastify.register(
        async (routes) => {
            routes.get('/', UserController.index)
            routes.get('/:id', UserController.show)
            routes.post('/', UserController.store)
            routes.put('/:id', UserController.update)
            routes.delete('/:id', UserController.delete)
        },
        { prefix: '/users' }
    )
}

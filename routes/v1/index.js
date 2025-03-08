const UserController = require('../../app/controllers/UserController')
const AuthController = require('../../app/controllers/AuthController')
const DirectoryTypeController = require('../../app/controllers/DirectoryTypeController')
const CategoryController = require('../../app/controllers/CategoryController')
const ListingController = require('../../app/controllers/ListingController')
const auth = require('../../app/middleware/auth')

module.exports = async (fastify) => {
    fastify.register(
        async (routes) => {
            routes.post('/login', AuthController.login)
            routes.post('/register', AuthController.register)
            routes.post('/re-send-otp', AuthController.reSendOTP)
            routes.post('/verify', AuthController.verify)
        },
        { prefix: '/auth' }
    )

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

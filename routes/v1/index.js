const UserController = require('../../app/controllers/UserController')
const AuthController = require('../../app/controllers/AuthController')

module.exports = async (fastify) => {
    fastify.register(
        async (authRoutes) => {
            authRoutes.post('/login', AuthController.login)
        },
        { prefix: '/auth' }
    )

    fastify.register(
        async (userRoutes) => {
            userRoutes.get('/', UserController.index)
            userRoutes.get('/:id', UserController.show)
            userRoutes.post('/', UserController.store)
            userRoutes.put('/:id', UserController.update)
            userRoutes.delete('/:id', UserController.delete)
        },
        { prefix: '/users' }
    )
}

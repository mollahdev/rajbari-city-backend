const UserController = require('../../app/controllers/UserController')

module.exports = async (fastify, reply) => {
    fastify.get('/users', UserController.index)
    fastify.get('/users/:id', UserController.show)
    fastify.post('/users', UserController.store)
    fastify.put('/users/:id', UserController.update)
    fastify.delete('/users/:id', UserController.delete)
}

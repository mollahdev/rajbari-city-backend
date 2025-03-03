const UserController = require('../../app/controllers/UserController')

module.exports = async (fastify, reply) => {
    fastify.get('/users', UserController.getUsers)
    fastify.get('/users/:id', UserController.getUserById)
    fastify.post('/users', UserController.createUser)
    fastify.put('/users/:id', UserController.updateUser)
    fastify.delete('/users/:id', UserController.deleteUser)
}

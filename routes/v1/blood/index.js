const auth = require('@/app/middleware/auth')
const BloodController = require('@/app/controllers/blood')

module.exports = async function (fastify) {
    fastify.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    fastify.addHook('onRequest', auth) //Middleware
}

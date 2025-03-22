const { ProfileController } = require('@/app/controllers/profile')
const auth = require('@/app/middleware/auth')
const { validateBody } = require('@/app/helpers/validation')
const { updateProfileSchema, passwordChangeSchema } = require('./index.schema')
const bloodRoutes = require('./blood')

module.exports = async function (fastify) {
    fastify.get('/', {
        handler: ProfileController.getCurrentProfile,
    })

    fastify.delete('/', {
        handler: ProfileController.deleteCurrentProfile,
    })

    fastify.patch('/', {
        preValidation: validateBody(updateProfileSchema),
        handler: ProfileController.updateProfile,
    })

    fastify.post('/password', {
        preValidation: validateBody(passwordChangeSchema),
        handler: ProfileController.updatePassword,
    })

    fastify.register(bloodRoutes, { prefix: '/blood' })

    fastify.addHook('onRequest', auth) //Middleware
}

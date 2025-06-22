const DiagnosticController = require('@/app/controllers/diagnostic')
const auth = require('@/app/middleware/auth')

module.exports = async function (fastify) {
    fastify.get('/', {
        handler: DiagnosticController.getAllDiagnostics,
    })

    fastify.get('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: DiagnosticController.getDiagnosticDetails,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

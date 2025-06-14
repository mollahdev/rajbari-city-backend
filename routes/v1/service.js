const ServiceController = require('@/app/controllers/service')
const auth = require('@/app/middleware/auth')

module.exports = async function (fastify) {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'categoryId'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 40 },
                    description: { type: 'string', maxLength: 250 },
                    categoryId: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: ServiceController.create,
    })

    fastify.get('/', {
        handler: ServiceController.getAll,
    })

    fastify.patch('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 40 },
                    description: { type: 'string', maxLength: 250 },
                    categoryId: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: ServiceController.update,
    })

    fastify.delete('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: ServiceController.delete,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

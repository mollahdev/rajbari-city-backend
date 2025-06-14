const CategoryController = require('@/app/controllers/category')
const auth = require('@/app/middleware/auth')

module.exports = async function (fastify) {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'group'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    group: {
                        type: 'string',
                        enum: ['general', 'hospital'],
                        default: 'general',
                    },
                },
            },
        },
        handler: CategoryController.create,
    })

    fastify.get('/', {
        handler: CategoryController.getAll,
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
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    slug: { type: 'string', minLength: 1, maxLength: 100 },
                },
            },
        },
        handler: CategoryController.update,
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
        handler: CategoryController.delete,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

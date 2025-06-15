const CategoryController = require('@/app/controllers/category')

module.exports = async function (fastify) {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'group'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 40 },
                    group: {
                        type: 'string',
                        enum: ['general', 'hospital'],
                        default: 'general',
                        maxLength: 40,
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
                    name: { type: 'string', minLength: 1, maxLength: 40 },
                    group: { type: 'string', minLength: 1, maxLength: 40 },
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
}

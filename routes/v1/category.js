const CategoryController = require('@/app/controllers/category')

module.exports = async function (fastify) {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    slug: { type: 'string', minLength: 1, maxLength: 100 },
                },
            },
        },
        handler: CategoryController.create,
    })

    // ToDo: Super Admin Only support is not implemented yet
    // fastify.addHook('onRequest', auth) //Middleware
}

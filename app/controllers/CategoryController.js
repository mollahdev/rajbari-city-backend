/**
 * Internal dependencies
 */
const Controller = require('./Controller')
const CategoryRepository = require('../repositories/CategoryRepository')
const { requestValidator } = require('../helpers')

class CategoryController {
    static async index(request, reply) {
        const errors = requestValidator(
            {
                type: 'object',
                properties: {
                    directoryTypeId: { type: 'integer' },
                },
                required: ['directoryTypeId'],
                additionalProperties: false,
            },
            request.query
        )

        if (Array.isArray(errors)) {
            return reply.status(422).send({ errors })
        }

        const repository = new CategoryRepository()
        try {
            const types = await repository.get()
            reply.status(201).send({ types })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = CategoryController

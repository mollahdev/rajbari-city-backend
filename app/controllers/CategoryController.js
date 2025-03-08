/**
 * Internal dependencies
 */
const Controller = require('./Controller')
const CategoryRepository = require('../repositories/CategoryRepository')
const { requestValidator } = require('../helpers')
const CategoryReadDTO = require('../dtos/CategoryReadDTO')

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

        const { directoryTypeId } = request.query

        const dto = new CategoryReadDTO()
        dto.directoryTypeId = directoryTypeId

        const repository = new CategoryRepository()
        try {
            const categories = await repository.get(dto)
            reply.status(201).send({ categories })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = CategoryController

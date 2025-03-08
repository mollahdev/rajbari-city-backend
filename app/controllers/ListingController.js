/**
 * Internal dependencies
 */
const Controller = require('./Controller')
const ListingRepository = require('../repositories/ListingRepository')
const { requestValidator } = require('../helpers')
const ListingReadDTO = require('../dtos/ListingReadDTO')

class ListingController {
    static async index(request, reply) {
        const errors = requestValidator(
            {
                type: 'object',
                properties: {
                    categoryId: { type: 'integer' },
                    page: { type: 'integer', minLength: 1 },
                },
                required: ['categoryId', 'page'],
                additionalProperties: false,
            },
            request.query
        )

        if (Array.isArray(errors)) {
            return reply.status(422).send({ errors })
        }

        const { categoryId, page } = request.query

        const dto = new ListingReadDTO()
        dto.categoryId = categoryId
        dto.page = page

        const repository = new ListingRepository()
        try {
            reply.status(201).send(await repository.get(dto))
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = ListingController

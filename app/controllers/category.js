const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const CategoryRepository = require('@/app/repositories/category')
const CategoryDTO = require('@/app/dtos/category')

class CategoryController extends Controller {
    static async create(request, reply) {
        try {
            const categoryRepository = new CategoryRepository()
            const categoryDTO = new CategoryDTO()
            const isAlreadyExists = await categoryRepository.findOne({
                where: { slug: request.body.slug },
            })

            if (isAlreadyExists) {
                throw new Error('Category with this slug already exists')
            }

            assign(categoryDTO, request.body)
            const response = await categoryRepository.create(categoryDTO)

            return {
                message: 'Category created successfully',
                data: {
                    id: response.id,
                    slug: response.slug,
                    name: response.name,
                    createdAt: response.createdAt,
                    updatedAt: response.updatedAt,
                },
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = CategoryController

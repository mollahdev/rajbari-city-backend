const { assign } = require('lodash')
const { Op } = require('@sequelize/core')
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

            reply.send({
                message: 'Category created successfully',
                data: response,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAll(request, reply) {
        try {
            const categoryRepository = new CategoryRepository()
            const categories = await categoryRepository.findAll({
                order: [['createdAt', 'DESC']],
            })

            reply.send({
                message: 'Categories retrieved successfully',
                data: categories,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async update(request, reply) {
        const { id } = request.params
        const { slug } = request.body

        try {
            const categoryRepository = new CategoryRepository()
            const categoryDTO = new CategoryDTO()
            const isAlreadyExists = await categoryRepository.findOne({
                where: { slug, id: { [Op.ne]: id } },
            })

            if (isAlreadyExists) {
                throw new Error('Category with this slug already exists')
            }

            assign(categoryDTO, request.body)
            await categoryRepository.update(categoryDTO, {
                where: { id },
            })

            reply.send({
                message: 'Category updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async delete(request, reply) {
        const { id } = request.params

        try {
            const categoryRepository = new CategoryRepository()
            await categoryRepository.destroy({ where: { id } })

            reply.send({
                message: 'Category deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = CategoryController

const { assign, lowerCase, trim } = require('lodash')
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
                where: {
                    group: lowerCase(trim(request.body.group)),
                    name: lowerCase(trim(request.body.name)),
                },
            })

            if (isAlreadyExists) {
                throw new Error('Category already exists')
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

        try {
            const categoryRepository = new CategoryRepository()
            const categoryDTO = new CategoryDTO()
            const category = await categoryRepository.findOne({ where: { id } })

            if (!category) {
                throw new Error('Category not found')
            }

            const groupName = request.body.group || category.group
            const categoryName = request.body.name || category.name

            const isAlreadyExists = await categoryRepository.findOne({
                where: {
                    group: lowerCase(trim(groupName)),
                    name: lowerCase(trim(categoryName)),
                    id: { [Op.ne]: id },
                },
            })

            if (isAlreadyExists) {
                throw new Error('Category already exists')
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

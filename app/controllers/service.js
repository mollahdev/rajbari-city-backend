const { assign, lowerCase, trim } = require('lodash')
const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const ServiceRepository = require('@/app/repositories/service')
const CategoryRespository = require('@/app/repositories/category')
const ServiceDTO = require('@/app/dtos/service')

class ServiceController extends Controller {
    static async create(request, reply) {
        try {
            const serviceRepo = new ServiceRepository()
            const categoryRepo = new CategoryRespository()
            const serviceDTO = new ServiceDTO()

            // check if the category exists
            const category = await categoryRepo.findOne({
                where: { id: request.body.categoryId },
            })

            if (!category) {
                throw new Error('Category not found')
            }

            const isAlreadyExists = await serviceRepo.findOne({
                where: {
                    categoryId: request.body.categoryId,
                    name: lowerCase(trim(request.body.name)),
                },
            })

            if (isAlreadyExists) {
                throw new Error('Already exists')
            }

            assign(serviceDTO, request.body)
            const response = await serviceRepo.create(serviceDTO)

            reply.send({
                message: 'Created successfully',
                data: response,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAll(request, reply) {
        try {
            const serviceRepo = new ServiceRepository()
            const services = await serviceRepo.findAll({
                order: [['createdAt', 'DESC']],
            })

            reply.send({
                message: 'Retrieved successfully',
                data: services,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async update(request, reply) {
        const { id } = request.params

        try {
            const serviceRepo = new ServiceRepository()
            const serviceDTO = new ServiceDTO()
            const service = await serviceRepo.findOne({ where: { id } })

            if (!service) {
                throw new Error('Service not found')
            }

            const serviceName = request.body.name || service.name
            const categoryId = request.body.categoryId || service.categoryId

            const isAlreadyExists = await serviceRepo.findOne({
                where: {
                    categoryId,
                    name: lowerCase(trim(serviceName)),
                    id: { [Op.ne]: id },
                },
            })

            if (isAlreadyExists) {
                throw new Error('Already exists')
            }

            assign(serviceDTO, request.body)
            await serviceRepo.update(serviceDTO, {
                where: { id },
            })

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async delete(request, reply) {
        const { id } = request.params

        try {
            const serviceRepo = new ServiceRepository()
            await serviceRepo.destroy({ where: { id } })

            reply.send({
                message: 'Deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = ServiceController

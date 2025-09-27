/**
 * External dependencies
 */
const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const DriverRepository = require('@/app/repositories/driver')
const DriverDTO = require('@/app/dtos/driver')

module.exports = class DriverController extends Controller {
    static async createDriver(request, reply) {
        const { id } = request.user

        try {
            const driverRepo = new DriverRepository()
            const driverDTO = new DriverDTO()

            assign(driverDTO, {
                ...request.body,
                userId: id,
                isActive: true,
            })

            await driverRepo.create(driverDTO)

            reply.send({
                message: 'Created successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDriverDetails(request, reply) {
        const { id } = request.user

        try {
            const driverRepo = new DriverRepository()
            const driver = await driverRepo.findOne({
                where: { userId: id },
            })

            if (!driver) {
                throw new Error('Driver not found')
            }

            reply.send({
                message: 'Fetched successfully',
                data: driver,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateDriverDetails(request, reply) {
        const { id } = request.user

        try {
            const driverRepo = new DriverRepository()
            const driverDTO = new DriverDTO()

            const driver = await driverRepo.findOne({ where: { userId: id } })
            if (!driver) {
                throw new Error('Driver not found')
            }

            assign(driverDTO, {
                ...request.body,
                userId: id,
            })

            await driverRepo.update(driverDTO, { where: { userId: id } })

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteDriver(request, reply) {
        const { id } = request.user

        try {
            const driverRepo = new DriverRepository()

            const driver = await driverRepo.findOne({ where: { userId: id } })
            if (!driver) {
                throw new Error('Driver not found')
            }

            await driverRepo.destroy({ where: { userId: id } })

            reply.send({
                message: 'Deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

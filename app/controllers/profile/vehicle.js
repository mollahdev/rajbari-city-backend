/**
 * External dependencies
 */
const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const VehicleRepository = require('@/app/repositories/vehicle')
const VehicleDTO = require('@/app/dtos/vehicle')
const DriverRepository = require('@/app/repositories/driver')

const { getFileUrl, getFileFromPath } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class VehicleController extends Controller {
    static async createVehicle(request, reply) {
        const { id } = request.user

        try {
            const driverRepo = new DriverRepository()
            const vehicleRepo = new VehicleRepository()
            const vehicleDTO = new VehicleDTO()

            const existingDriver = await driverRepo.findOne({ userId: id })

            if (!existingDriver) {
                throw new Error(
                    'Driver profile not found. Please create driver profile first.'
                )
            }

            assign(vehicleDTO, {
                ...request.body,
                userId: id,
                size: request.body.size,
                image: getFileFromPath(request.body.image),
            })

            await vehicleRepo.create(vehicleDTO)

            reply.send({
                message: 'Created successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllVehicles(request, reply) {
        const { id } = request.user

        try {
            const vehicleRepo = new VehicleRepository()
            const vehicles = await vehicleRepo.findAll({
                where: { userId: id },
                order: [['updatedAt', 'DESC']],
            })

            vehicles.forEach((vehicle) => {
                vehicle.setDataValue(
                    'image',
                    getFileUrl(vehicle.image || PLACEHOLDER_IMAGE)
                )
            })

            reply.send({
                message: 'Retrieved successfully',
                data: vehicles,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getVehicleDetails(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const vehicleRepo = new VehicleRepository()
            const vehicle = await vehicleRepo.findOne({
                where: { id, userId },
            })

            if (!vehicle) {
                throw new Error('Vehicle not found')
            }

            vehicle.setDataValue(
                'image',
                getFileUrl(vehicle.image || PLACEHOLDER_IMAGE)
            )

            reply.send({
                message: 'Retrieved successfully',
                data: vehicle,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateVehicle(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            const vehicleRepo = new VehicleRepository()
            const driverRepo = new DriverRepository()
            const vehicleDTO = new VehicleDTO()
            const vehicle = await vehicleRepo.findOne({
                where: { id, userId },
            })

            const existingDriver = await driverRepo.findOne({ userId })

            if (!existingDriver) {
                throw new Error(
                    'Driver profile not found. Please create driver profile first.'
                )
            }

            if (!vehicle) {
                throw new Error('Vehicle not found')
            }

            assign(vehicleDTO, {
                ...vehicle,
                ...request.body,
                userId,
                image: getFileFromPath(request.body.image || vehicle.image),
            })

            await vehicleRepo.update(vehicleDTO, {
                where: { id, userId },
            })

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteVehicle(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            const vehicleRepo = new VehicleRepository()
            const vehicle = await vehicleRepo.findOne({
                where: { id, userId },
            })

            if (!vehicle) {
                throw new Error('Vehicle not found')
            }

            await vehicleRepo.destroy({
                where: { id, userId },
            })

            reply.send({
                message: 'Deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

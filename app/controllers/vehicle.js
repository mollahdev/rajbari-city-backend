/**
 * External dependencies
 */
const { Op } = require('sequelize')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const VehicleRepository = require('@/app/repositories/vehicle')
const DriverRepository = require('@/app/repositories/driver')
const UserRepository = require('@/app/repositories/user')
const models = require('@/models')

const { getFileUrl } = require('@/app/helpers')
const {
    PLACEHOLDER_IMAGE,
    PLACEHOLDER_AVATAR,
} = require('@/app/helpers/constants')

module.exports = class VehicleController extends Controller {
    static async getAllVehicles(request, reply) {
        const { district } = request.user

        try {
            const vehicleRepo = new VehicleRepository()
            const userRepo = new UserRepository()

            const drivers = await userRepo.findAll({
                where: { district },
                include: [
                    {
                        model: models.Driver,
                        as: 'driver',
                        where: { isActive: true },
                        required: true,
                    },
                ],
            })

            if (!drivers) {
                throw new Error('No drivers found')
            }

            const driverIds = drivers.map((driver) => driver.id)

            const vehicles = await vehicleRepo.findAll({
                where: {
                    userId: { [Op.in]: driverIds },
                },
                order: [['updatedAt', 'DESC']],
            })

            vehicles.forEach((vehicle) => {
                vehicle.setDataValue(
                    'image',
                    getFileUrl(vehicle.image || PLACEHOLDER_IMAGE)
                )

                const driver = drivers.find((d) => d.id === vehicle.userId)
                vehicle.setDataValue('driver', {
                    name: driver.name,
                    dialCode: driver.dialCode,
                    mobile: driver.mobile,
                    profilePictureUrl: getFileUrl(
                        driver.profilePictureUrl || PLACEHOLDER_AVATAR
                    ),
                    experience: driver.driver.experience,
                })
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
        const { id } = request.params

        try {
            const vehicleRepo = new VehicleRepository()
            const userRepo = new UserRepository()
            const driverRepo = new DriverRepository()

            const vehicle = await vehicleRepo.findOne({
                where: { id },
            })

            if (!vehicle) {
                throw new Error('Vehicle not found')
            }

            const driver = await driverRepo.findOne({
                where: {
                    userId: vehicle.userId,
                    isActive: true,
                },
            })

            if (!driver) {
                throw new Error('Driver not found')
            }

            const user = await userRepo.findOne({
                where: { id: vehicle.userId },
            })

            if (!user) {
                throw new Error('User not found')
            }

            const allVehicles = await vehicleRepo.findAll({
                where: {
                    userId: vehicle.userId,
                    id: { [Op.ne]: vehicle.id },
                },
            })

            allVehicles.forEach((v) => {
                v.setDataValue(
                    'image',
                    getFileUrl(v.image || PLACEHOLDER_IMAGE)
                )
            })

            vehicle.setDataValue(
                'image',
                getFileUrl(vehicle.image || PLACEHOLDER_IMAGE)
            )

            vehicle.setDataValue('driver', {
                name: user.name,
                dialCode: user.dialCode,
                mobile: user.mobile,
                profilePictureUrl: getFileUrl(
                    user.profilePictureUrl || PLACEHOLDER_AVATAR
                ),
                experience: driver.experience,
            })

            vehicle.setDataValue('otherVehicles', allVehicles)

            reply.send({
                message: 'Retrieved successfully',
                data: vehicle,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

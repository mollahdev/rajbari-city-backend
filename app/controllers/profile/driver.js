/**
 * External dependencies
 */
const { isString, assign, uniq } = require('lodash')
const { Op, literal, where } = require('sequelize')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const UserRepository = require('@/app/repositories/user')
const DriverRepository = require('@/app/repositories/driver')

module.exports = class DriverController extends Controller {
    static async getDriverDetails(request, reply) {
        const { id } = request.user

        try {
            const driverRepo = new DriverRepository()
            const driver = await driverRepo.findOne({
                where: { userId: id },
            })

            reply.send({
                message: 'Fetched successfully',
                data: driver,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

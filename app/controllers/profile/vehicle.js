/**
 * External dependencies
 */
const { isString, assign, uniq } = require('lodash')
const { Op, literal, where } = require('sequelize')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const DoctorRepository = require('@/app/repositories/doctor')
const DoctorAvailabilityRepository = require('@/app/repositories/doctor-availability')
const UserRepository = require('@/app/repositories/user')
const HospitalRepository = require('@/app/repositories/hospital')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const CategoryRepository = require('@/app/repositories/category')

const { getFileUrl, normalizeCode } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

module.exports = class VehicleController extends Controller {
    static async getAllVehicles(request, reply) {
        const { district } = request.user

        try {
            reply.send({
                message: 'Fetched successfully',
                data: [],
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getVehicleDetails(request, reply) {
        const { id } = request.params

        try {
            reply.send({
                message: 'Fetched successfully',
                data: [],
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

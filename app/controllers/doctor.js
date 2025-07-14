/**
 * External dependencies
 */
const { isString } = require('lodash')
const { Op, literal, where } = require('sequelize')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const DoctorRepository = require('@/app/repositories/doctor')

// const UserRe
const { getFileUrl, normalizeCode } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

module.exports = class DoctorController {
    static async getAllDoctors(request, reply) {
        const { district } = request.user

        try {
            const doctorRepo = new DoctorRepository()

            const whereDoctorTable = {
                district,
                status: 'active',
            }

            if (request.query.category) {
                whereDoctorTable[Op.and] = [
                    where(
                        literal(
                            `JSON_CONTAINS(category_ids, '"${request.query.category}"')`
                        ),
                        true
                    ),
                ]
            }

            if (request.query.bmdcNumber) {
                whereDoctorTable.bmdcNumber = normalizeCode(
                    request.query.bmdcNumber
                )
            }

            if (request.query.location) {
                whereDoctorTable.location = request.query.location
            }

            const doctors = await doctorRepo.findAll({
                where: whereDoctorTable,
                order: [['updatedAt', 'DESC']],
            })

            doctors.forEach((item) => {
                item.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(item.profilePictureUrl || PLACEHOLDER_AVATAR)
                )

                if (isString(item.categoryIds)) {
                    item.setDataValue(
                        'categoryIds',
                        JSON.parse(item.categoryIds || '[]')
                    )
                }
            })

            reply.send({
                message: 'Fetched successfully',
                data: doctors,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

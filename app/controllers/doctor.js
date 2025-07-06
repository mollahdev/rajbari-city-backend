/**
 * External dependencies
 */
const { isString } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const DoctorRepository = require('@/app/repositories/doctor')

// const UserRe
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

module.exports = class DoctorController {
    static async getAllDoctors(request, reply) {
        const { district } = request.user

        try {
            const doctorRepo = new DoctorRepository()
            const doctors = await doctorRepo.findAll({
                where: {
                    district,
                    status: 'active',
                },
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

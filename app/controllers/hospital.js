/**
 * External dependencies
 */
const { isString } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const HospitalRepository = require('@/app/repositories/hospital')
const HospitalServiceRepository = require('@/app/repositories/hospital-service')

// const UserRe
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class HospitalController {
    static async getAllHospitals(request, reply) {
        const { district } = request.user

        try {
            const hospitalRepo = new HospitalRepository()
            const hospitals = await hospitalRepo.findAll({
                where: {
                    district,
                    status: 'active',
                },
                order: [
                    ['is_partner', 'DESC'],
                    ['is_verified', 'DESC'],
                    ['updatedAt', 'DESC'],
                ],
            })

            hospitals.forEach((item) => {
                item.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(item.thumbnailUrl || PLACEHOLDER_IMAGE)
                )

                if (isString(item.mobiles)) {
                    item.setDataValue(
                        'mobiles',
                        JSON.parse(item.mobiles || '[]')
                    )
                }

                if (isString(item.socials)) {
                    item.setDataValue(
                        'socials',
                        JSON.parse(item.socials || '[]')
                    )
                }
            })

            reply.send({
                message: 'data fetched successfully',
                data: hospitals,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getHospitalDetails(request, reply) {
        const { id } = request.params
        const { district } = request.user

        try {
            if (!id) {
                throw new Error('hospital id is required')
            }

            const hospitalRepo = new HospitalRepository()
            const hospitalServiceRepo = new HospitalServiceRepository()

            const hospital = await hospitalRepo.findOne({
                where: {
                    id,
                    district,
                    status: 'active',
                },
            })

            if (!hospital) {
                throw new Error('Hospital not found')
            }

            const services = await hospitalServiceRepo.getServicesByHospitalId(
                hospital.id
            )

            hospital.setDataValue('services', services)
            hospital.setDataValue(
                'thumbnailUrl',
                getFileUrl(hospital.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            if (isString(hospital.mobiles)) {
                hospital.setDataValue(
                    'mobiles',
                    JSON.parse(hospital.mobiles || '[]')
                )
            }

            if (isString(hospital.socials)) {
                hospital.setDataValue(
                    'socials',
                    JSON.parse(hospital.socials || '[]')
                )
            }

            reply.send({
                message: 'Foundation details',
                data: hospital,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

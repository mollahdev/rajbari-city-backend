/**
 * External dependencies
 */
const { assign, isString } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const HospitalRepository = require('@/app/repositories/hospital')
const UserRepository = require('@/app/repositories/user')
const HospitalServiceRepository = require('@/app/repositories/hospital-service')
const HospitalDTO = require('@/app/dtos/hospital')

// const UserRe
const { getFileUrl, getFileFromPath } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class HospitalController {
    static async createHospital(request, reply) {
        const { district, id } = request.user
        const { isMunicipality, municipality, union } = request.body

        try {
            const hospitalRepo = new HospitalRepository()
            const hospitalDTO = new HospitalDTO()
            const userRepository = new UserRepository()
            const hospitalServiceRepo = new HospitalServiceRepository()

            // check if the user exists
            const user = await userRepository.findOne({
                where: { id },
            })

            if (!user || !user.isVerified || !user.isOnboarded) {
                throw new Error('User not found')
            }

            assign(hospitalDTO, {
                ...request.body,
                userId: id,
                district,
                thumbnailUrl: getFileFromPath(request.body.thumbnailUrl),
            })

            if (isMunicipality) {
                hospitalDTO.municipality = municipality
                hospitalDTO.union = null
            } else {
                hospitalDTO.union = union
                hospitalDTO.municipality = null
            }

            const hospital = await hospitalRepo.create(hospitalDTO)

            hospital.setDataValue(
                'thumbnailUrl',
                getFileUrl(hospital.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            const services = await hospitalServiceRepo.createServices(
                hospital.id,
                request.body.services
            )

            hospital.setDataValue('services', services)
            return {
                message: 'Created successfully',
                data: hospital,
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateHospitalDetails(request, reply) {
        const { id: hospitalId } = request.params
        const { id: userId } = request.user

        try {
            if (!hospitalId) {
                throw new Error('Hospital id is required')
            }

            const hospitalDTO = new HospitalDTO()
            const hospitalRepo = new HospitalRepository()
            const hospitalServiceRepo = new HospitalServiceRepository()

            const hospital = await hospitalRepo.findOne({
                where: {
                    id: hospitalId,
                    userId,
                },
            })

            if (!hospital) {
                throw new Error('Hospital not found')
            }

            assign(hospitalDTO, {
                id: hospitalId,
                ...request.body,
                thumbnailUrl: getFileFromPath(
                    request.body.thumbnailUrl || hospital.thumbnailUrl
                ),
            })

            if (request.body.isMunicipality) {
                hospitalDTO.municipality = request.body.municipality || null
                hospitalDTO.union = null
            } else {
                hospitalDTO.union = request.body.union || null
                hospitalDTO.municipality = null
            }

            await hospitalRepo.update(hospitalDTO, {
                where: { id: hospitalId, userId },
            })

            await hospitalServiceRepo.updateServices(
                hospitalId,
                request.body.services
            )

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllHospitals(request, reply) {
        const { id: userId } = request.user

        try {
            const hospitalRepo = new HospitalRepository()
            const hospitals = await hospitalRepo.findAll({
                where: {
                    userId,
                },
                order: [['createdAt', 'DESC']],
            })

            hospitals.forEach((item) => {
                item.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(item.thumbnailUrl || PLACEHOLDER_IMAGE)
                )
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
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('hospital id is required')
            }

            const hospitalRepo = new HospitalRepository()
            const hospitalServiceRepo = new HospitalServiceRepository()

            const hospital = await hospitalRepo.findOne({
                where: {
                    id,
                    userId,
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

    static async deleteOneHospital(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('Hospital id is required')
            }

            const hospitalRepo = new HospitalRepository()
            const hospital = await hospitalRepo.findOne({
                where: { id, userId },
            })

            if (!hospital) {
                throw new Error('Foundation not found')
            }

            await hospitalRepo.destroy({
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

/**
 * External dependencies
 */
const { assign, isString, isArray, uniq } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const HospitalRepository = require('@/app/repositories/hospital')
const UserRepository = require('@/app/repositories/user')
const HospitalServiceRepository = require('@/app/repositories/hospital-service')
const HospitalDTO = require('@/app/dtos/hospital')
const HospitalServiceDTO = require('@/app/dtos/hospital-service')
const ServiceRespository = require('@/app/repositories/service')

// const UserRe
const { getFileUrl, getFileFromPath } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class HospitalController {
    static async createHospital(request, reply) {
        const { district, id } = request.user
        const { isMunicipality, municipality, union } = request.body
        let services = request.body.services

        try {
            const hospitalRepo = new HospitalRepository()
            const hospitalDTO = new HospitalDTO()
            const userRepository = new UserRepository()
            const hospitalServiceRepo = new HospitalServiceRepository()
            const serviceRepo = new ServiceRespository()

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

            // making sure the services exits in service table
            const newServices = []
            if (isArray(services)) {
                services = uniq(services)

                const servicePromises = services.map(async (serviceId) => {
                    const serviceDTO = new HospitalServiceDTO()

                    const service = await serviceRepo.findOne({
                        where: { id: serviceId },
                    })

                    if (service) {
                        serviceDTO.hospitalId = hospital.id
                        serviceDTO.serviceId = serviceId
                        newServices.push(serviceId)
                        return hospitalServiceRepo.create(serviceDTO)
                    }
                })

                await Promise.all(servicePromises)
            }

            hospital.setDataValue('services', newServices)
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
        let services = request.body.services

        try {
            if (!hospitalId) {
                throw new Error('Hospital id is required')
            }

            const hospitalDTO = new HospitalDTO()
            const hospitalRepo = new HospitalRepository()
            const hospitalServiceRepo = new HospitalServiceRepository()
            const serviceRepo = new ServiceRespository()

            const hospital = await hospitalRepo.findOne({
                where: {
                    id: hospitalId,
                    userId: userId,
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

            // making sure the services exits in service table and delete existing services
            if (isArray(services)) {
                services = uniq(services)

                // delete all existing services for the hospital
                await hospitalServiceRepo.destroy({
                    where: { hospitalId },
                })

                const servicePromises = services.map(async (serviceId) => {
                    const serviceDTO = new HospitalServiceDTO()
                    const service = await serviceRepo.findOne({
                        where: { id: serviceId },
                    })

                    if (service) {
                        serviceDTO.hospitalId = hospitalId
                        serviceDTO.serviceId = serviceId
                        return hospitalServiceRepo.create(serviceDTO)
                    }
                })

                await Promise.all(servicePromises)
            }

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllHospitals(request, reply) {
        const { district } = request.user

        try {
            const hospitalRepo = new HospitalRepository()
            const hospitals = await hospitalRepo.findAll({
                where: {
                    district,
                },
                order: [
                    ['is_partner', 'DESC'],
                    ['is_verified', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
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

            const services = await hospitalServiceRepo.findAll({
                where: { hospitalId: hospital.id },
            })

            const serviceIds = services.map((service) => service.serviceId)

            hospital.setDataValue(
                'thumbnailUrl',
                getFileUrl(hospital.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            hospital.setDataValue('services', serviceIds)

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

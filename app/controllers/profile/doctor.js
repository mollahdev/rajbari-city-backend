const { assign } = require('lodash')
const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const DoctorDTO = require('@/app/dtos/doctor')
const DoctorRepository = require('@/app/repositories/doctor')
const HospitalRepository = require('@/app/repositories/hospital')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const CategoryRepository = require('@/app/repositories/category')
const DoctorAvailabilityRepository = require('@/app/repositories/doctor-availability')
const Controller = require('@/app/controllers/controller')

const {
    getFileUrl,
    getFileFromPath,
    isValidTimeFormat,
} = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

class DoctorController {
    static async createDoctor(request, reply) {
        const { id: userId, district } = request.user

        try {
            const categoryRepo = new CategoryRepository()
            const doctorRepo = new DoctorRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()
            const doctorAvailabilityRepo = new DoctorAvailabilityRepository()
            const doctorDTO = new DoctorDTO()

            const doctorExists = await doctorRepo.findOne({
                where: {
                    bmdcNumber: request.body.bmdcNumber,
                    location: request.body.location,
                },
            })

            if (doctorExists) {
                throw new Error(
                    'Doctor already exists with this BMDC number and location'
                )
            }

            if (!categoryRepo.isExists(request.body.categoryIds)) {
                throw new Error('Category not found')
            }

            if ('hospital' === request.body.locationType) {
                const isExists = await hospitalRepo.isExists(
                    request.body.location
                )
                if (!isExists) {
                    throw new Error('Hospital not found')
                }
            }

            if ('diagnostic' === request.body.locationType) {
                const isExists = await diagnosticRepo.isExists(
                    request.body.location
                )
                if (!isExists) {
                    throw new Error('Diagnostic center not found')
                }
            }

            const times = request.body.availability
            const isValidTime = Object.keys(times).every((day) => {
                const { startTime, endTime } = times[day]
                return (
                    isValidTimeFormat(startTime) && isValidTimeFormat(endTime)
                )
            })

            if (!isValidTime) {
                throw new Error('Invalid time format in availability')
            }

            assign(doctorDTO, {
                ...request.body,
                userId,
                district,
                profilePictureUrl: getFileFromPath(
                    request.body.profilePictureUrl
                ),
            })

            const response = await doctorRepo.create(doctorDTO)
            await doctorAvailabilityRepo.create({
                doctorId: response.id,
                availability: request.body.availability,
            })

            reply.send({
                message: 'Created successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDoctorList(request, reply) {
        const { id: userId } = request.user

        try {
            const bloodRequestRepo = new BloodRequestRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

            const requestTableWhere = {
                userId,
            }

            if (request.query.bloodGroup) {
                requestTableWhere.bloodGroup = request.query.bloodGroup
            }

            const bloodRequests = await bloodRequestRepo.findAll({
                where: requestTableWhere,
                order: [['createdAt', 'DESC']],
            })

            const hospitalIds = []
            const diagnosticIds = []

            bloodRequests.forEach((item) => {
                if (item.locationType === 'hospital') {
                    hospitalIds.push(item.location)
                } else if (item.locationType === 'diagnostic') {
                    diagnosticIds.push(item.location)
                }
            })

            const hospitals = await hospitalRepo.findAll({
                where: {
                    id: { [Op.in]: hospitalIds },
                },
            })

            const diagnostics = await diagnosticRepo.findAll({
                where: {
                    id: { [Op.in]: diagnosticIds },
                },
            })

            // attach additional data to each blood request
            bloodRequests.forEach((request) => {
                if (request.locationType === 'hospital') {
                    const hospital = hospitals.find(
                        (h) => h.id === request.location
                    )
                    if (hospital) {
                        request.setDataValue('locationDetails', {
                            name: hospital.name,
                            address: hospital.address,
                            googleMapUrl: hospital.googleMapUrl,
                            upazila: hospital.upazila,
                            union: hospital.union,
                            district: hospital.district,
                            isMunicipality: hospital.isMunicipality,
                            municipality: hospital.municipality,
                        })
                    }
                } else if (request.locationType === 'diagnostic') {
                    const diagnostic = diagnostics.find(
                        (d) => d.id === request.location
                    )
                    if (diagnostic) {
                        request.setDataValue('locationDetails', {
                            name: diagnostic.name,
                            address: diagnostic.address,
                            googleMapUrl: diagnostic.googleMapUrl,
                            upazila: diagnostic.upazila,
                            union: diagnostic.union,
                            district: diagnostic.district,
                            isMunicipality: diagnostic.isMunicipality,
                            municipality: diagnostic.municipality,
                        })
                    }
                }

                // is expired
                const reqDate = new Date(request.date)
                const today = new Date()
                const isExpired =
                    reqDate.toISOString().slice(0, 10) <
                    today.toISOString().slice(0, 10)
                request.setDataValue('isExpired', isExpired)
            })

            reply.send({
                message: 'Fetched successfully',
                data: bloodRequests,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDoctorDetails(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const requestRepo = new BloodRequestRepository()
            const bloodRequest = await requestRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!bloodRequest) {
                throw new Error('Blood request not found')
            }

            reply.send({
                message: 'Fetched successfully',
                data: bloodRequest,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateDoctorDetails(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const bloodRequestRepo = new BloodRequestRepository()
            const bloodRequestDTO = new BloodRequestDTO()

            const bloodRequest = await bloodRequestRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!bloodRequest) {
                throw new Error('Blood request not found')
            }

            assign(bloodRequestDTO, {
                ...bloodRequest.dataValues,
                ...request.body,
            })

            await bloodRequestRepo.update(bloodRequestDTO, {
                where: { id, userId },
            })

            await bloodRequestRepo.socketUpdateRequest({
                user: request.user,
                requestId: id,
                socket: this.io,
            })

            bloodRequestRepo.sendPushNotification({
                user: request.user,
                requestId: id,
            })

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteDoctor(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const bloodRequest = new BloodRequestRepository()
            const existingRequest = await bloodRequest.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!existingRequest) {
                throw new Error('Blood request not found')
            }

            await bloodRequest.socketDeleteRequest({
                user: request.user,
                requestId: id,
                socket: this.io,
            })

            await bloodRequest.destroy({
                where: {
                    userId,
                    id,
                },
            })

            reply.send({
                message: 'Deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = DoctorController

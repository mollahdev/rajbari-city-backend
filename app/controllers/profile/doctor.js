const { assign, uniq, isString, trim, isEmpty } = require('lodash')
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
    normalizeCode,
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
            const bmdcNumber = trim(request.body.bmdcNumber || '')

            if (isEmpty(normalizeCode(bmdcNumber))) {
                throw new Error('BMDC number is required')
            }

            const doctorExists = await doctorRepo.findOne({
                where: {
                    bmdcNumber: normalizeCode(bmdcNumber),
                    location: request.body.location,
                },
            })

            if (doctorExists) {
                throw new Error(
                    'Doctor already exists with this BMDC number and location'
                )
            }

            const isExists = await categoryRepo.isExists(
                request.body.categoryIds
            )

            if (!isExists) {
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
                categoryIds: uniq(request.body.categoryIds),
                bmdcNumber: normalizeCode(bmdcNumber),
                profilePictureUrl: getFileFromPath(
                    request.body.profilePictureUrl
                ),
            })

            const response = await doctorRepo.create(doctorDTO)
            await doctorAvailabilityRepo.createAvailability({
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
            const doctorRepo = new DoctorRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

            const doctors = await doctorRepo.findAll({
                where: {
                    userId,
                },
                order: [['createdAt', 'DESC']],
            })

            const hospitalIds = []
            const diagnosticIds = []

            doctors.forEach((item) => {
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

                if (item.locationType === 'hospital') {
                    const hospital = hospitals.find(
                        (h) => h.id === item.location
                    )
                    if (hospital) {
                        item.setDataValue('locationDetails', {
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
                } else if (item.locationType === 'diagnostic') {
                    const diagnostic = diagnostics.find(
                        (d) => d.id === item.location
                    )
                    if (diagnostic) {
                        item.setDataValue('locationDetails', {
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
            })

            reply.send({
                message: 'Fetched successfully',
                data: doctors,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDoctorDetails(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const doctorRepo = new DoctorRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()
            const doctorAvailabilityRepo = new DoctorAvailabilityRepository()
            const doctor = await doctorRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!doctor) {
                throw new Error('Doctor not found')
            }

            if (doctor.locationType === 'hospital') {
                const hospital = await hospitalRepo.findOne({
                    where: { id: doctor.location },
                })
                if (hospital) {
                    doctor.setDataValue('locationDetails', {
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
            } else if (doctor.locationType === 'diagnostic') {
                const diagnostic = await diagnosticRepo.findOne({
                    where: { id: doctor.location },
                })
                if (diagnostic) {
                    doctor.setDataValue('locationDetails', {
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

            const availability =
                await doctorAvailabilityRepo.getAvailabilityByDoctorId(
                    doctor.id
                )
            doctor.setDataValue('availability', availability || {})
            doctor.setDataValue(
                'profilePictureUrl',
                getFileUrl(doctor.profilePictureUrl || PLACEHOLDER_AVATAR)
            )

            if (isString(doctor.categoryIds)) {
                doctor.setDataValue(
                    'categoryIds',
                    JSON.parse(doctor.categoryIds || '[]')
                )
            }

            reply.send({
                message: 'Fetched successfully',
                data: doctor,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateDoctorDetails(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const doctorRepo = new DoctorRepository()
            const doctorAvailabilityRepo = new DoctorAvailabilityRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()
            const doctorDTO = new DoctorDTO()
            const categoryRepo = new CategoryRepository()
            const bmdcNumber = trim(request.body.bmdcNumber || '')

            if (isEmpty(bmdcNumber)) {
                throw new Error('BMDC number is required')
            }

            const doctor = await doctorRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!doctor) {
                throw new Error('Doctor not found')
            }

            if (request.body.categoryIds) {
                const isExists = await categoryRepo.isExists(
                    request.body.categoryIds
                )

                if (!isExists) {
                    throw new Error('Category not found')
                }
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

            assign(doctorDTO, {
                ...doctor.dataValues,
                ...request.body,
                categoryIds: uniq(request.body.categoryIds),
                bmdcNumber: normalizeCode(bmdcNumber || doctor.bmdcNumber),
                profilePictureUrl: getFileFromPath(
                    request.body.profilePictureUrl || doctor.profilePictureUrl
                ),
            })

            await doctor.update(doctorDTO, {
                where: { id, userId },
            })

            await doctorAvailabilityRepo.updateAvailability({
                doctorId: doctor.id,
                availability: request.body.availability,
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
            const doctorRepo = new DoctorRepository()
            const doctor = await doctorRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!doctor) {
                throw new Error('Doctor not found')
            }

            await doctor.destroy({
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

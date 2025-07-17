/**
 * External dependencies
 */
const { isString, assign, uniq } = require('lodash')
const { Op, literal, where } = require('sequelize')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const DoctorRepository = require('@/app/repositories/doctor')
const DoctorAvailabilityRepository = require('@/app/repositories/doctor-availability')
const UserRepository = require('@/app/repositories/user')
const HospitalRepository = require('@/app/repositories/hospital')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const CategoryRepository = require('@/app/repositories/category')

const { getFileUrl, normalizeCode } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

module.exports = class DoctorController {
    static async getAllDoctors(request, reply) {
        const { district } = request.user

        try {
            const doctorRepo = new DoctorRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

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

            const hospitalIds = []
            const diagnosticIds = []

            doctors.forEach((doctor) => {
                if (doctor.locationType === 'hospital') {
                    hospitalIds.push(doctor.location)
                } else if (doctor.locationType === 'diagnostic') {
                    diagnosticIds.push(doctor.location)
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
        const { id } = request.params
        const { district } = request.user

        try {
            const doctorRepo = new DoctorRepository()
            const userRepo = new UserRepository()
            const doctorAvailableRepo = new DoctorAvailabilityRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

            const doctor = await doctorRepo.findOne({
                where: {
                    id,
                    district,
                    status: 'active',
                },
            })

            if (!doctor) {
                throw new Error('Doctor not found')
            }

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

            const user = await userRepo.findOne({
                where: {
                    id: doctor.userId,
                },
            })

            if (user) {
                doctor.setDataValue('user', {
                    name: user.name,
                    profilePictureUrl: getFileUrl(
                        user.profilePictureUrl || PLACEHOLDER_AVATAR
                    ),
                })
            }

            const relatedDoctors = await doctorRepo.findAll({
                where: {
                    status: 'active',
                    bmdcNumber: doctor.bmdcNumber,
                },
            })

            const include = await Promise.all(
                relatedDoctors.map(async (item) => {
                    const availability =
                        await doctorAvailableRepo.getAvailabilityByDoctorId(
                            item.id
                        )
                    const locationDetails = {}

                    if (item.locationType === 'hospital') {
                        const hospital = await hospitalRepo.findOne({
                            where: {
                                id: item.location,
                            },
                        })

                        if (hospital) {
                            assign(locationDetails, {
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
                    }

                    if (item.locationType === 'diagnostic') {
                        const diagnostic = await diagnosticRepo.findOne({
                            where: {
                                id: item.location,
                            },
                        })

                        if (diagnostic) {
                            assign(locationDetails, {
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

                    return {
                        locationType: item.locationType,
                        location: item.location,
                        mobile: item.mobile,
                        dialCode: item.dialCode,
                        locationDetails,
                        availability: availability || {},
                    }
                })
            )

            doctor.setDataValue('include', include)

            reply.send({
                message: 'Fetched successfully',
                data: doctor,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDoctorCategory(request, reply) {
        const { district } = request.user

        try {
            const doctorRepo = new DoctorRepository()
            const categoryRepo = new CategoryRepository()
            const doctors = await doctorRepo.findAll({
                where: {
                    district,
                    status: 'active',
                },
                attributes: ['categoryIds'],
            })

            const categories = []
            doctors.forEach((doctor) => {
                categories.push(doctor.categoryIds)
            })

            const uniqueCategoryIds = uniq(categories.flat(Infinity))

            const categoryDetails = await categoryRepo.findAll({
                where: {
                    id: { [Op.in]: uniqueCategoryIds },
                },
            })

            reply.send({
                message: 'Fetched successfully',
                data: categoryDetails,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

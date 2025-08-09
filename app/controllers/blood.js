/**
 * External dependencies
 */
const { orderBy, isString } = require('lodash')
const { Op, literal } = require('sequelize')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const BloodFoundationDonorRepository = require('@/app/repositories/blood-foundation-donor')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const BloodRequestRepository = require('@/app/repositories/blood-request')
const UserRepository = require('@/app/repositories/user')
const HospitalRepository = require('@/app/repositories/hospital')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const models = require('@/models')

// const UserRe
const { getFileUrl, todayDateOnly } = require('@/app/helpers')
const {
    PLACEHOLDER_IMAGE,
    PLACEHOLDER_AVATAR,
} = require('@/app/helpers/constants')
const { RECEIVE } = require('@/socket/events')

module.exports = class BloodController {
    static async getAllFoundations(request, reply) {
        const { district } = request.user

        try {
            const foundationRepository = new BloodFoundationRepository()
            const foundations = await foundationRepository.findAllFoundation({
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

            foundations.forEach((foundation) => {
                foundation.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(foundation.thumbnailUrl || PLACEHOLDER_IMAGE)
                )
            })

            reply.send({
                message: 'Foundations fetched successfully',
                data: foundations,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getFoundationDetails(request, reply) {
        const { id } = request.params

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: {
                    id,
                    status: 'active',
                },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            foundation.setDataValue(
                'thumbnailUrl',
                getFileUrl(foundation.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            if (isString(foundation.mobiles)) {
                foundation.setDataValue(
                    'mobiles',
                    JSON.parse(foundation.mobiles || '[]')
                )
            }

            if (isString(foundation.socials)) {
                foundation.setDataValue(
                    'socials',
                    JSON.parse(foundation.socials || '[]')
                )
            }

            foundation.setDataValue('donors', [])

            reply.send({
                message: 'Foundation details',
                data: foundation,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllFoundationsDonors(request, reply) {
        const { id } = request.params

        try {
            const foundationDonorRepository =
                new BloodFoundationDonorRepository()

            const foundationDonors = await foundationDonorRepository.findAll({
                where: {
                    foundationId: id,
                    status: 'active',
                },
            })

            const finalDonors = []
            foundationDonors.forEach((donor) => {
                donor.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(donor.profilePictureUrl || PLACEHOLDER_AVATAR)
                )
                const values = donor.dataValues
                if (values.isActive || values.status === 'active') {
                    finalDonors.push({
                        id: values.id,
                        name: values.name,
                        profilePictureUrl: values.profilePictureUrl,
                        bloodGroup: values.bloodGroup,
                        lastDonatedAt: values.lastDonatedAt,
                        createdAt: values.createdAt,
                        updatedAt: values.updatedAt,
                        status: values.status,
                    })
                }
            })

            reply.send({
                message: 'Fetched successfully',
                data: orderBy(finalDonors, ['updatedAt'], ['desc']),
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllDonors(request, reply) {
        const { district } = request.user

        try {
            const searchTerm = request.query.search || ''
            const bloodDonorRepository = new BloodDonorRepository()

            const bloodTableWhere = {
                isActive: true,
            }

            if (request.query.bloodGroup) {
                bloodTableWhere.bloodGroup = request.query.bloodGroup
            }

            const userTableWhere = {
                district,
            }

            if (request.query.upazila) {
                userTableWhere.upazila = request.query.upazila
            }

            if (request.query.gender) {
                userTableWhere.gender = request.query.gender
            }

            if (searchTerm) {
                userTableWhere[Op.or] = [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                ]
            }

            const donors = await bloodDonorRepository.findAll({
                where: bloodTableWhere,
                include: [
                    {
                        model: models.User,
                        as: 'donor',
                        where: userTableWhere,
                        required: true,
                    },
                ],
            })

            const result = []
            donors.forEach((donor) => {
                const values = donor.dataValues
                result.push({
                    id: values.userId,
                    name: values.donor.name,
                    profilePictureUrl: getFileUrl(
                        values.donor.profilePictureUrl || PLACEHOLDER_AVATAR
                    ),
                    bloodGroup: values.bloodGroup,
                    lastDonatedAt: values.lastDonatedAt,
                    updatedAt: values.updatedAt,
                    description: values.description,
                    upazila: values.donor.upazila,
                    mobile: values.donor.mobile,
                    dialCode: values.donor.dialCode,
                })
            })

            reply.send({
                message: 'Donors fetched successfully',
                data: orderBy(result, ['updatedAt'], ['desc']),
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllBloodRequests(request, reply) {
        const { district } = request.user

        try {
            const bloodRequestRepository = new BloodRequestRepository()
            const userRepo = new UserRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

            const bloodRequests = await bloodRequestRepository.findAll({
                where: {
                    district,
                    [Op.and]: [literal(`DATE(date) >= '${todayDateOnly()}'`)],
                    ...(request.query.bloodGroup && {
                        bloodGroup: request.query.bloodGroup,
                    }),
                },
                order: [['updatedAt', 'DESC']],
            })

            const hospitalIds = []
            const diagnosticIds = []
            const userIds = []

            bloodRequests.forEach((request) => {
                if (request.locationType === 'hospital') {
                    hospitalIds.push(request.location)
                } else if (request.locationType === 'diagnostic') {
                    diagnosticIds.push(request.location)
                }

                userIds.push(request.userId)
            })

            const users = await userRepo.findAll({
                where: {
                    id: { [Op.in]: userIds },
                },
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
                const user = users.find((u) => u.id === request.userId)
                if (user) {
                    request.setDataValue('user', {
                        name: user.name,
                        profilePictureUrl: getFileUrl(
                            user.profilePictureUrl || PLACEHOLDER_AVATAR
                        ),
                    })
                }

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
            })

            reply.send({
                message: 'Blood requests fetched successfully',
                data: bloodRequests,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getBloodRequestDetails(request, reply) {
        const { id } = request.params

        try {
            if (!id) {
                throw new Error('Blood request id is required')
            }

            const bloodRequestRepository = new BloodRequestRepository()
            const bloodRequest = await bloodRequestRepository.findOne({
                where: { id },
            })

            if (!bloodRequest) {
                throw new Error('Blood request not found')
            }

            const userRepo = new UserRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

            const user = await userRepo.findOne({
                where: { id: bloodRequest.userId },
            })

            if (user) {
                bloodRequest.setDataValue('user', {
                    name: user.name,
                    profilePictureUrl: getFileUrl(
                        user.profilePictureUrl || PLACEHOLDER_AVATAR
                    ),
                })
            }

            if (bloodRequest.locationType === 'hospital') {
                const hospital = await hospitalRepo.findOne({
                    where: { id: bloodRequest.location },
                })
                if (hospital) {
                    bloodRequest.setDataValue('locationDetails', {
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
            } else if (bloodRequest.locationType === 'diagnostic') {
                const diagnostic = await diagnosticRepo.findOne({
                    where: { id: bloodRequest.location },
                })
                if (diagnostic) {
                    bloodRequest.setDataValue('locationDetails', {
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

            reply.send({
                message: 'Blood request details fetched successfully',
                data: bloodRequest,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

/**
 * External dependencies
 */
const { orderBy, isString } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const BloodFoundationDonorRepository = require('@/app/repositories/blood-foundation-donor')
const OrganizationUserRepository = require('@/app/repositories/organization-user')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const models = require('@/models')

// const UserRe
const { getFileUrl } = require('@/app/helpers')
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
                    ['createdAt', 'DESC'],
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
        const { district } = request.user

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const bloodDonorRepository = new BloodDonorRepository()
            const foundationDonorRepository =
                new BloodFoundationDonorRepository()
            const organizationUserRepository = new OrganizationUserRepository()
            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: {
                    id,
                    district,
                    status: 'active',
                },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const foundationDonors = await foundationDonorRepository.findAll({
                where: {
                    foundationId: id,
                    status: 'active',
                },
            })

            const organizationDonors = await organizationUserRepository.findAll(
                {
                    where: {
                        organizationId: id,
                        status: 'active',
                    },
                }
            )

            const organizationDonorIds = organizationDonors.map(
                (donor) => donor.userId
            )
            const bloodDonors =
                await bloodDonorRepository.getDonorByUserId(
                    organizationDonorIds
                )

            const donors = [...foundationDonors, ...bloodDonors]
            const finalDonors = []

            donors.forEach((donor) => {
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
                    })
                }
            })

            foundation.setDataValue(
                'thumbnailUrl',
                getFileUrl(foundation.thumbnailUrl || PLACEHOLDER_IMAGE)
            )
            foundation.setDataValue(
                'donors',
                orderBy(finalDonors, ['createdAt'], ['desc'])
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

            reply.send({
                message: 'Foundation details',
                data: foundation,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllDonors(request, reply) {
        const { district } = request.user

        try {
            const bloodDonorRepository = new BloodDonorRepository()
            const donors = await bloodDonorRepository.findAll({
                where: {
                    isActive: true,
                },
                include: [
                    {
                        model: models.User,
                        as: 'donor',
                        where: {
                            district,
                        },
                        required: true,
                    },
                ],
            })

            const result = []
            donors.forEach((donor) => {
                const values = donor.dataValues

                result.push({
                    id: values.id,
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

    static async joinFoundation(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            const foundationRepository = new BloodFoundationRepository()
            const donorRepository = new BloodDonorRepository()
            const organizationRepository = new OrganizationUserRepository()
            const isDonor = await donorRepository.isExists(userId)
            const isFoundation = await foundationRepository.isExists(id)

            if (!isDonor || !isFoundation) {
                throw new Error('Donor or foundation not found')
            }

            const result = await organizationRepository.create(userId, id)
            const bloodDonors = await donorRepository.getDonorByUserId(userId)
            const foundation = await foundationRepository.findOne({
                where: { id },
            })

            bloodDonors.forEach((donor) => {
                donor.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(donor.profilePictureUrl || PLACEHOLDER_AVATAR)
                )

                donor.setDataValue('status', result.status)
            })

            // send real time data to foundation owner
            this.io
                .to(`user:${foundation.userId}`)
                .emit(RECEIVE.FOUNDATION_JOIN_REQUEST, {
                    foundationId: id,
                    user: bloodDonors[0],
                })

            reply.send({
                message: 'Joined successfully',
                data: result,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

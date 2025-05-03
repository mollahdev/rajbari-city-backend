/**
 * External dependencies
 */
const { orderBy } = require('lodash')
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
                order: [['createdAt', 'DESC']],
            })

            foundations.forEach((foundation) => {
                const thumbnailFile = foundation.thumbnailUrl
                    ? `${foundation.userId}/${foundation.thumbnailUrl}`
                    : PLACEHOLDER_IMAGE

                foundation.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(thumbnailFile)
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
                const profileFile = donor.profilePictureUrl
                    ? `${donor.id}/${donor.profilePictureUrl}`
                    : PLACEHOLDER_AVATAR

                donor.setDataValue('profilePictureUrl', getFileUrl(profileFile))
                const values = donor.dataValues
                finalDonors.push({
                    id: values.id,
                    name: values.name,
                    profilePictureUrl: values.profilePictureUrl,
                    bloodGroup: values.bloodGroup,
                    lastDonatedAt: values.lastDonatedAt,
                    createdAt: values.createdAt,
                    updatedAt: values.updatedAt,
                })
            })

            const thumbnailFile = foundation.thumbnailUrl
                ? `${foundation.userId}/${foundation.thumbnailUrl}`
                : PLACEHOLDER_IMAGE

            foundation.setDataValue('thumbnailUrl', getFileUrl(thumbnailFile))
            foundation.setDataValue(
                'donors',
                orderBy(finalDonors, ['createdAt'], ['desc'])
            )

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

                const profileFile = values.donor.profilePictureUrl
                    ? `${values.donor.id}/${values.donor.profilePictureUrl}`
                    : PLACEHOLDER_AVATAR

                result.push({
                    id: values.id,
                    name: values.donor.name,
                    profilePictureUrl: getFileUrl(profileFile),
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
}

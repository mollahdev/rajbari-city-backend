const {
    assign,
    every,
    isPlainObject,
    isString,
    size,
    isEmpty,
} = require('lodash')
/**
 * Internal dependencies
 */
const BloodRepository = require('../repositories/BloodRepository')
const BloodFoundationDTO = require('../dtos/BloodFoundationDTO')
const Controller = require('./Controller')
const { getFileUrl } = require('../helpers')
const {
    PLACEHOLDER_AVATAR,
    PLACEHOLDER_IMAGE,
} = require('../helpers/constants')

class BloodController {
    static async getAllFoundations(request, reply) {
        const { district, id } = request.user

        try {
            const bloodRepository = new BloodRepository()
            const foundations = await bloodRepository.findAllFoundationBy({
                where: {
                    district,
                },
            })

            foundations.forEach((foundation) => {
                const thumbnailFile = foundation.thumbnailUrl
                    ? `${foundation.userId}/${foundation.thumbnailUrl}`
                    : PLACEHOLDER_IMAGE
                assign(foundation, {
                    thumbnailUrl: getFileUrl(thumbnailFile),
                })
            })

            reply.send({
                message: 'Foundations fetched successfully',
                data: foundations,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getOneFoundation(request, reply) {
        const { id } = request.params

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const bloodRepository = new BloodRepository()
            let foundation = await bloodRepository.findOneFoundationById(id)

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            foundation = foundation.dataValues

            const thumbnailFile = foundation.thumbnailUrl
                ? `${foundation.userId}/${foundation.thumbnailUrl}`
                : PLACEHOLDER_IMAGE

            assign(foundation, {
                thumbnailUrl: getFileUrl(thumbnailFile),
                members: foundation.members.map((member) => {
                    const BloodFoundationUser = member.BloodFoundationUser
                    const avatarFile = member.profilePictureUrl
                        ? `${member.id}/${member.profilePictureUrl}`
                        : PLACEHOLDER_AVATAR

                    return {
                        id: member.id,
                        name: member.name,
                        profilePictureUrl: getFileUrl(avatarFile),
                        role: BloodFoundationUser.role,
                        status: BloodFoundationUser.status,
                    }
                }),
                donors: foundation.donors.map((donor) => {
                    const avatarFile = donor.profilePictureUrl
                        ? `${donor.id}/${donor.profilePictureUrl}`
                        : PLACEHOLDER_AVATAR

                    return {
                        id: donor.id,
                        name: donor.name,
                        profilePictureUrl: getFileUrl(avatarFile),
                        status: donor.status,
                    }
                }),
            })

            reply.send({
                message: 'Foundation fetched successfully',
                data: foundation,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteOneFoundation(request, reply) {
        const { id } = request.params

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const bloodRepository = new BloodRepository()
            const foundation = await bloodRepository.findOneFoundationById(id)

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            // check if the user is the owner of the foundation
            if (foundation.userId !== request.user.id) {
                throw new Error(
                    'You are not authorized to delete this foundation'
                )
            }

            await bloodRepository.deleteFoundationById(id)

            reply.send({
                message: 'Foundation deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async createFoundation(request, reply) {
        const { district, id } = request.user
        const {
            name,
            thumbnailUrl,
            description,
            mobiles,
            socials,
            upazila,
            isMunicipality,
            municipality,
            union,
        } = request.body

        try {
            if (!every(mobiles, BloodController.isValidMobileObj)) {
                throw new Error('Invalid mobiles')
            }

            if (!every(socials, BloodController.isValidSocialObj)) {
                throw new Error('Invalid socials')
            }

            const bloodRepository = new BloodRepository()
            const foundationDTO = new BloodFoundationDTO()

            foundationDTO.name = name
            foundationDTO.thumbnailUrl = thumbnailUrl
            foundationDTO.description = description
            foundationDTO.mobiles = mobiles
            foundationDTO.socials = socials
            foundationDTO.district = district
            foundationDTO.upazila = upazila
            foundationDTO.userId = id
            foundationDTO.isMunicipality = isMunicipality

            if (isMunicipality) {
                foundationDTO.municipality = municipality
                foundationDTO.union = null
            } else {
                foundationDTO.union = union
                foundationDTO.municipality = null
            }

            const foundationId =
                await bloodRepository.createFoundation(foundationDTO)
            const foundation =
                await bloodRepository.findOneFoundationById(foundationId)

            const thumbnailFile = foundation.thumbnailUrl
                ? `${foundation.userId}/${foundation.thumbnailUrl}`
                : PLACEHOLDER_IMAGE

            assign(foundation, {
                thumbnailUrl: getFileUrl(thumbnailFile),
            })

            return {
                message: 'Foundation created successfully',
                data: foundation,
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async joinFoundation(request, reply) {
        const { foundationId } = request.body
        const { id } = request.user

        try {
            const bloodRepository = new BloodRepository()
            const foundations =
                await bloodRepository.findManyFoundationByIds(foundationId)

            if (isEmpty(foundations)) {
                throw new Error('Foundation not found')
            }

            const result = await bloodRepository.addUserToManyFoundations(
                id,
                foundationId
            )

            reply.send({
                message: 'Foundation joined successfully',
                data: result,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static isValidMobileObj(obj) {
        return (
            isPlainObject(obj) &&
            isString(obj.dialCode) &&
            obj.dialCode === '880' &&
            isString(obj.mobile) &&
            size(obj.mobile) === 10
        )
    }

    static isValidSocialObj(obj) {
        return isPlainObject(obj) && isString(obj.title) && isString(obj.url)
    }
}

module.exports = BloodController

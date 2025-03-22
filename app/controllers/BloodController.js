const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const BloodRepository = require('../repositories/BloodRepository')
const UserRepository = require('../repositories/UserRepository')
const BloodFoundationDTO = require('../dtos/BloodFoundationDTO')
const BloodDonorDTO = require('../dtos/BloodDonorDTO')

const Controller = require('./Controller')
const { getFileUrl } = require('../helpers')
const {
    PLACEHOLDER_AVATAR,
    PLACEHOLDER_IMAGE,
} = require('../helpers/constants')

class BloodController {
    static async createDonor(request, reply) {
        const { id } = request.user
        const { bloodGroup, description, isActive, lastDonatedAt } =
            request.body

        try {
            const bloodRepository = new BloodRepository()
            const isExists = await bloodRepository.isAlreadyDonor(id)

            if (isExists) {
                throw new Error('You are already a donor')
            }

            const donorDTO = new BloodDonorDTO()
            donorDTO.userId = id
            donorDTO.bloodGroup = bloodGroup
            donorDTO.description = description
            donorDTO.isActive = isActive
            donorDTO.lastDonatedAt = lastDonatedAt

            const response = await bloodRepository.createDonor(donorDTO)

            reply.send({
                message: 'Donor created successfully',
                data: response,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteDonor(request, reply) {
        const { id } = request.user

        try {
            const bloodRepository = new BloodRepository()
            await bloodRepository.deleteDonorById(id)

            reply.send({
                message: 'Donor deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

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
            const foundation = await bloodRepository.findOneFoundationById(id)

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const thumbnailFile = foundation.thumbnailUrl
                ? `${foundation.userId}/${foundation.thumbnailUrl}`
                : PLACEHOLDER_IMAGE

            assign(foundation.dataValues, {
                thumbnailUrl: getFileUrl(thumbnailFile),
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

            const foundation =
                await bloodRepository.createFoundation(foundationDTO)

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
            const user = new UserRepository()
            const isDonor = await bloodRepository.isAlreadyDonor(id)

            if (!isDonor) {
                throw new Error('You are not a donor')
            }

            // check if the foundation exists
            const foundation =
                await bloodRepository.findOneFoundationById(foundationId)

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const result = await user.addOrganization(id, foundationId)

            reply.send({
                message: 'Foundation joined successfully',
                data: result,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = BloodController

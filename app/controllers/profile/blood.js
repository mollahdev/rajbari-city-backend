const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const UserRepository = require('@/app/repositories/user')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const BloodFoundationDTO = require('@/app/dtos/blood-foundation')
const BloodDonorDTO = require('@/app/dtos/blood-donor')
const OrganizationUserRepository = require('@/app/repositories/organization-user')
const BloodFoundationDonorDTO = require('@/app/dtos/blood-foundation-donor')
const BloodFoundationDonorRepository = require('@/app/repositories/blood-foundation-donor')

const Controller = require('@/app/controllers/controller')
const { getFileUrl, getFileFromPath } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

class BloodController {
    static async createDonor(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            const isExists = await donorRepository.isExists(id)

            if (isExists) {
                throw new Error('You are already a donor')
            }

            const donorDTO = new BloodDonorDTO()
            assign(donorDTO, {
                userId: id,
                ...request.body,
            })

            const response = await donorRepository.create(donorDTO)

            reply.send({
                message: 'Donor created successfully',
                data: response,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDonorDetails(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            const donor = await donorRepository.findOne({
                where: { userId: id },
                attributes: { exclude: ['userId', 'user_id'] },
            })

            if (!donor) {
                throw new Error('Donor not found')
            }

            reply.send({
                message: 'Donor fetched successfully',
                data: donor,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateDonorDetails(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            const isExists = await donorRepository.isExists(id)

            if (!isExists) {
                throw new Error('You are not a donor')
            }

            const donorDTO = new BloodDonorDTO()
            assign(donorDTO, request.body)

            await donorRepository.update(donorDTO, {
                where: { userId: id },
            })

            reply.send({
                message: 'Donor updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteDonor(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            await donorRepository.destroy({
                where: { userId: id },
            })

            reply.send({
                message: 'Donor deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllFoundations(request, reply) {
        const { id: userId } = request.user

        try {
            const foundationRepository = new BloodFoundationRepository()
            const foundations = await foundationRepository.findAllFoundation({
                where: { userId },
                order: [['createdAt', 'DESC']],
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

    static async getFoundationDetails(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: {
                    id,
                    userId: userId,
                },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const thumbnailFile = foundation.thumbnailUrl
                ? `${foundation.userId}/${foundation.thumbnailUrl}`
                : PLACEHOLDER_IMAGE

            foundation.setDataValue('thumbnailUrl', getFileUrl(thumbnailFile))

            reply.send({
                message: 'Foundation details',
                data: foundation,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateFoundationDetails(request, reply) {
        const { id: foundationId } = request.params
        const { id: userId } = request.user

        try {
            if (!foundationId) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: {
                    id: foundationId,
                    userId: userId,
                },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            // check if the user is the owner of the foundation
            if (foundation.userId !== userId) {
                throw new Error(
                    'You are not authorized to update this foundation'
                )
            }

            if (request.body.thumbnailFile) {
                request.body.thumbnailUrl = getFileFromPath(
                    request.body.thumbnailFile
                )
            }

            const foundationDTO = new BloodFoundationDTO()
            assign(foundationDTO, {
                id: foundationId,
                ...request.body,
            })

            if (request.body.isMunicipality) {
                foundationDTO.isMunicipality = true
                foundationDTO.municipality = request.body.municipality || null
                foundationDTO.union = null
            } else {
                foundationDTO.isMunicipality = false
                foundationDTO.union = request.body.union || null
                foundationDTO.municipality = null
            }

            await foundationRepository.update(foundationDTO, {
                where: { id: foundationId, userId },
            })

            reply.send({
                message: 'Foundation updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteOneFoundation(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: { id, userId },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            // check if the user is the owner of the foundation
            if (foundation.userId !== request.user.id) {
                throw new Error(
                    'You are not authorized to delete this foundation'
                )
            }

            await foundationRepository.destroy({
                where: { id, userId },
            })

            reply.send({
                message: 'Foundation deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async createFoundation(request, reply) {
        const { district, id } = request.user
        const { isMunicipality, municipality, union } = request.body

        try {
            const foundationRepository = new BloodFoundationRepository()
            const foundationDTO = new BloodFoundationDTO()
            const userRepository = new UserRepository()

            // check if the user exists
            const user = await userRepository.findOne({
                where: { id },
            })

            if (!user || !user.isVerified || !user.isOnboarded) {
                throw new Error('User not found')
            }

            assign(foundationDTO, {
                ...request.body,
                userId: id,
                district,
            })

            if (isMunicipality) {
                foundationDTO.municipality = municipality
                foundationDTO.union = null
            } else {
                foundationDTO.union = union
                foundationDTO.municipality = null
            }

            const foundation = await foundationRepository.create(foundationDTO)

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

            reply.send({
                message: 'Joined successfully',
                data: result,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async addFoundationDonor(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            const donorDTO = new BloodFoundationDonorDTO()
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: { id, userId },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const donorExists = await donorRepository.findOne({
                where: { mobile: request.body.mobile, foundationId: id },
            })

            if (donorExists) {
                throw new Error('Donor already exists')
            }

            assign(donorDTO, {
                ...request.body,
                foundationId: id,
            })

            await donorRepository.create(donorDTO)

            reply.send({
                message: 'Joined successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateFoundationDonor(request, reply) {
        const { foundationId, donorId } = request.params
        const { id: userId } = request.user

        try {
            const donorDTO = new BloodFoundationDonorDTO()
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: { id: foundationId, userId },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const donor = await donorRepository.findOne({
                where: { id: donorId, foundationId },
            })

            if (!donor) {
                throw new Error('Donor not found')
            }

            assign(donorDTO, {
                ...request.body,
                id: donorId,
                foundationId,
            })

            await donorRepository.update(donorDTO, {
                where: { id: donorId, foundationId },
            })

            reply.send({
                message: 'Donor updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteFoundationDonor(request, reply) {
        const { foundationId, donorId } = request.params
        const { id: userId } = request.user

        try {
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const foundation = await foundationRepository.findOne({
                where: { id: foundationId, userId },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const donor = await donorRepository.findOne({
                where: { id: donorId, foundationId },
            })

            if (!donor) {
                throw new Error('Donor not found')
            }

            await donorRepository.destroy({
                where: { id: donorId, foundationId },
            })

            reply.send({
                message: 'Donor deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = BloodController

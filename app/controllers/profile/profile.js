const { omit, assign } = require('lodash')
const bcrypt = require('bcryptjs')
/**
 * Internal dependencies
 */
const UserRepository = require('@/app/repositories/user')
const UserDTO = require('@/app/dtos/user')
const Controller = require('@/app/controllers/controller')
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

class ProfileController {
    static async getCurrentProfile(request, reply) {
        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findCurrentUser(request.user.id)

            if (!user) {
                throw new Error('User not found')
            }

            const avatarFile = user.profilePictureUrl
                ? `${user.id}/${user.profilePictureUrl}`
                : PLACEHOLDER_AVATAR
            assign(user.dataValues, {
                profilePictureUrl: getFileUrl(avatarFile),
            })

            reply.send({
                message: 'User profile fetched successfully',
                data: user,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteCurrentProfile(request, reply) {
        const { id } = request.user
        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findOneById(id)

            if (!user) {
                throw new Error('User not found')
            }

            await userRepository.delete(id)

            reply.send({
                message: 'User profile deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateProfile(request, reply) {
        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', request.user.id)

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified || !user.isOnboarded) {
                throw new Error('User is not verified or onboarded')
            }

            if (request.body.profilePictureFile) {
                request.body.profilePictureUrl = request.body.profilePictureFile
            }

            const userDTO = new UserDTO()
            assign(userDTO, {
                id: request.user.id,
                ...request.body,
            })

            if (request.body.isMunicipality) {
                userDTO.isMunicipality = true
                userDTO.municipality = request.body.municipality || null
                userDTO.union = null
            } else {
                userDTO.isMunicipality = false
                userDTO.union = request.body.union || null
                userDTO.municipality = null
            }

            await userRepository.update(userDTO)

            return {
                message: 'User profile updated successfully',
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updatePassword(request, reply) {
        const { oldPassword, newPassword } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', request.user.id)

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified) {
                throw new Error('User is not verified')
            }

            const isPasswordValid = await bcrypt.compare(
                oldPassword,
                user.password
            )

            if (!isPasswordValid) {
                throw new Error('Old password is incorrect')
            }

            const userDTO = new UserDTO()
            userDTO.id = request.user.id
            userDTO.password = newPassword

            await userRepository.update(userDTO)

            return {
                message: 'User password updated successfully',
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = ProfileController

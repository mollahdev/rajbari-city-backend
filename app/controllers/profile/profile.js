const { assign } = require('lodash')
const bcrypt = require('bcryptjs')
const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const UserRepository = require('@/app/repositories/user')
const UserDTO = require('@/app/dtos/user')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const TokenRepository = require('@/app/repositories/token')
const TokenDTO = require('@/app/dtos/token')
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

            assign(user, {
                profilePictureUrl: getFileUrl(
                    user.profilePictureUrl || PLACEHOLDER_AVATAR
                ),
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
            const donorRepository = new BloodDonorRepository()
            const user = await userRepository.findOne({ where: { id } })

            if (!user) {
                throw new Error('User not found')
            }

            await donorRepository.socketDeleteDonor(request.user, this.io)
            await userRepository.destroy({
                where: { id },
            })

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
            const donorRepository = new BloodDonorRepository()
            const user = await userRepository.findOne({
                where: { id: request.user.id },
            })

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
            assign(userDTO, request.body)

            if (request.body.isMunicipality) {
                userDTO.isMunicipality = true
                userDTO.municipality = request.body.municipality || null
                userDTO.union = null
            } else {
                userDTO.isMunicipality = false
                userDTO.union = request.body.union || null
                userDTO.municipality = null
            }

            await userRepository.update(userDTO, {
                where: { id: request.user.id },
            })

            await donorRepository.socketUpdateDonor(request.user, this.io)

            return {
                message: 'User profile updated successfully',
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updatePassword(request, reply) {
        const { token, id } = request.user
        const { oldPassword, newPassword } = request.body

        try {
            const tokenDTO = new TokenDTO()
            const tokenRepository = new TokenRepository()
            const userRepository = new UserRepository()
            const user = await userRepository.findOne({
                where: { id },
            })

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
            userDTO.password = newPassword

            await userRepository.update(userDTO, {
                where: { id },
            })

            assign(tokenDTO, {
                isValid: false,
            })

            await tokenRepository.update(tokenDTO, {
                where: { userId: id, token: { [Op.ne]: token } },
            })

            return {
                message: 'User password updated successfully',
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = ProfileController

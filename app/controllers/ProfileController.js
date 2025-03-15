const { omit, assign } = require('lodash')
const bcrypt = require('bcryptjs')
/**
 * Internal dependencies
 */
const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')
const Controller = require('./Controller')
const { getFileUrl, getFileFromPath } = require('../helpers')
const { PLACEHOLDER_AVATAR } = require('../helpers/constants')

class ProfileController {
    static async getCurrentProfile(request, reply) {
        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', request.user.id)

            if (!user) {
                throw new Error('User not found')
            }

            const filteredUser = omit(user.dataValues, [
                'password',
                'id',
                'otp',
                'otpCreatedAt',
            ])

            const avatarFile = user.profilePictureUrl
                ? `${user.id}/${user.profilePictureUrl}`
                : PLACEHOLDER_AVATAR
            assign(filteredUser, {
                profilePictureUrl: getFileUrl(avatarFile),
            })

            return {
                message: 'User profile fetched successfully',
                data: filteredUser,
            }
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

            if (!user.isVerified) {
                throw new Error('User is not verified')
            }

            const userDTO = new UserDTO()
            userDTO.id = request.user.id

            if (request.body.profilePictureFile) {
                request.body.profilePictureUrl = getFileFromPath(
                    request.body.profilePictureFile
                )
            }

            assign(userDTO, request.body)

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

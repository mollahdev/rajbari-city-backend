/**
 * Internal dependencies
 */
const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')
const Controller = require('./Controller')
const { omit, assign } = require('lodash')

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
            assign(userDTO, request.body)

            await userRepository.update(userDTO)

            return {
                message: 'User profile updated successfully',
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = ProfileController

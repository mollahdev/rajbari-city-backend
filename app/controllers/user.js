const { assign, trimStart } = require('lodash')
/**
 * Internal dependencies
 */
const UserRepository = require('@/app/repositories/user')
const Controller = require('@/app/controllers/controller')
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

class UserController {
    static async getUserByMobile(request, reply) {
        const { mobile } = request.params
        const { district } = request.user

        try {
            const userRepo = new UserRepository()
            const user = await userRepo.findOne({
                where: {
                    mobile: trimStart(mobile, '0'),
                    district,
                    isOnboarded: true,
                },
                attributes: [
                    'id',
                    'name',
                    'profilePictureUrl',
                    'mobile',
                    'dialCode',
                ],
            })

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
}

module.exports = UserController

/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const UserRepository = require('./user')
const { RECEIVE } = require('@/socket/events')
const { isRoleHigher, getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')
module.exports = class UserRoleRepository extends RepositoryBase {
    constructor() {
        super('UserRole')
    }

    async #emitSocketEvent(props, eventName) {
        const { userRoleId, socket } = props
        const userRepo = new UserRepository()
        const updatedRole = await this.model.findOne({
            where: { id: userRoleId },
        })

        if (!updatedRole) return

        const userData = await userRepo.findOne({
            where: { id: updatedRole.userId },
        })

        updatedRole.setDataValue('userData', {
            name: userData.name,
            mobile: userData.mobile,
            dialCode: userData.dialCode,
            profilePictureUrl: getFileUrl(
                userData.profilePictureUrl || PLACEHOLDER_AVATAR
            ),
        })

        const receivers = await this.model.findAll({
            where: {
                organizationId: updatedRole.organizationId,
            },
        })

        if (!receivers) return

        receivers.forEach((item) => {
            if (!isRoleHigher(updatedRole.role, item.role, true)) return
            socket.to(`user.${item.userId}`).emit(eventName, updatedRole)
        })
    }

    async socketUpdateUserRole(props) {
        await this.#emitSocketEvent(props, RECEIVE.UPDATE_USER_ROLE)
    }

    async socketDeleteUserRole(props) {
        await this.#emitSocketEvent(props, RECEIVE.DELETE_USER_ROLE)
    }
}

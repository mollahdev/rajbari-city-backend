/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const { RECEIVE } = require('@/socket/events')
const { isRoleHigher } = require('@/app/helpers')

module.exports = class UserRoleRepository extends RepositoryBase {
    constructor() {
        super('UserRole')
    }

    async socketUpdateUserRole(props) {
        const { userRoleId, socket } = props
        const updatedRole = await this.model.findOne({
            where: { id: userRoleId },
        })

        if (!updatedRole) return

        const receivers = await this.model.findAll({
            where: {
                organizationId: updatedRole.organizationId,
            },
        })

        if (!receivers) return

        receivers.forEach((item) => {
            if (!isRoleHigher(updatedRole.role, item.role, true)) return
            socket
                .to(`user.${item.userId}`)
                .emit(RECEIVE.UPDATE_USER_ROLE, updatedRole)
        })
    }

    async socketDeleteUserRole(props) {
        const { deletedRole, socket } = props
        const receivers = await this.model.findAll({
            where: {
                organizationId: deletedRole.organizationId,
            },
        })

        if (!receivers) return

        receivers.forEach((item) => {
            if (!isRoleHigher(deletedRole.role, item.role, true)) return
            socket
                .to(`user.${item.userId}`)
                .emit(RECEIVE.DELETE_USER_ROLE, deletedRole)
        })
    }
}

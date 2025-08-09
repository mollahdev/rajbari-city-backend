const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const Controller = require('@/app/controllers/controller')
const UserRoleRepository = require('@/app/repositories/user-role')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const UserRoleDTO = require('@/app/dtos/user-role')

class AccessController extends Controller {
    static async acceptAccess(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const roleRepo = new UserRoleRepository()
            const roleDTO = new UserRoleDTO()

            const userRole = await roleRepo.findOne({
                where: {
                    id,
                    userId,
                    status: 'pending',
                },
            })

            if (!userRole) {
                throw new Error('Access invitation not found')
            }

            roleDTO.status = 'active'
            await roleRepo.update(roleDTO, { where: { id } })

            await roleRepo.socketUpdateUserRole({
                userRoleId: id,
                socket: this.io,
            })

            reply.send({
                message: 'Access accepted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async rejectAccess(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const roleRepo = new UserRoleRepository()
            const roleDTO = new UserRoleDTO()

            const userRole = await roleRepo.findOne({
                where: {
                    id,
                    userId,
                },
            })

            if (!userRole) {
                throw new Error('Access invitation not found')
            }

            roleDTO.status = 'rejected'
            await roleRepo.update(roleDTO, { where: { id } })
            await roleRepo.socketUpdateUserRole({
                userRoleId: id,
                socket: this.io,
            })

            reply.send({
                message: 'Access rejected successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getInvitationList(request, reply) {
        const { id: userId } = request.user

        try {
            const roleRepo = new UserRoleRepository()
            const bloodFoundationRepo = new BloodFoundationRepository()
            const invitations = await roleRepo.findAll({
                where: {
                    userId,
                    status: 'pending',
                },
                ordered: [['updated', 'DESC']],
            })

            const bloodFoundationsIds = []
            const organizations = []
            invitations.forEach((item) => {
                if ('blood_foundation' == item.organizationType) {
                    bloodFoundationsIds.push(item.organizationId)
                }
            })

            const foundations = await bloodFoundationRepo.findAll({
                where: {
                    id: {
                        [Op.in]: bloodFoundationsIds,
                    },
                },
            })

            organizations.push(...foundations)

            organizations.forEach((item) => {
                const invitation = invitations.find(
                    (inv) => inv.organizationId === item.id
                )
                invitation.setDataValue('organizationData', {
                    id: item.id,
                    name: item.name,
                    thumbnailUrl: item.thumbnailUrl,
                })
            })

            reply.send({
                message: 'Access invitations retrieved successfully',
                data: invitations,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = AccessController

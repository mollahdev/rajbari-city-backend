/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const { ROLES } = require('@/app/helpers/constants')
const UserRoleRepository = require('./user-role')

module.exports = class BloodFoundationRepository extends RepositoryBase {
    constructor() {
        super('BloodFoundation')
    }

    async isExists(id) {
        const result = await this.findOne({
            where: { id },
        })

        return !isEmpty(result)
    }

    async getUserRoleStatus({ userId, foundationId }) {
        const result = await this.model.findOne({
            where: {
                userId,
                id: foundationId,
            },
        })

        if (result) {
            return {
                role: ROLES.OWNER,
                status: 'active',
            }
        }

        const userRoleRepo = new UserRoleRepository()
        const userRole = await userRoleRepo.findOne({
            where: {
                userId,
                organizationId: foundationId,
            },
        })

        if (userRole) {
            return {
                role: userRole.role,
                status: userRole.status,
            }
        }

        return null
    }
}

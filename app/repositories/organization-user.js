/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class OrganizationUserRepository extends RepositoryBase {
    constructor() {
        super('OrganizationUser')
    }

    async isExists(userId, organizationId) {
        const result = await this.findOne({
            where: { userId, organizationId },
        })

        return !isEmpty(result)
    }

    async create(userId, organizationId, role = 'member') {
        // check if the user is already joined the organization
        const isAlreadyJoined = await this.isExists(userId, organizationId)

        if (isAlreadyJoined)
            throw new Error('User already joined the organization')

        return await this.model.create({
            userId,
            organizationId,
            role,
        })
    }
}

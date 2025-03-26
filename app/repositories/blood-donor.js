/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class BloodDonorRepository extends RepositoryBase {
    constructor() {
        super('BloodDonor')
    }

    async isExists(userId) {
        const result = await this.findOne({
            where: { userId },
        })

        return !isEmpty(result)
    }
}

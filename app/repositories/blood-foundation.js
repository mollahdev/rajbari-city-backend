/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

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

    async findAllFoundation(query) {
        return await this.model.findAll(query)
    }
}

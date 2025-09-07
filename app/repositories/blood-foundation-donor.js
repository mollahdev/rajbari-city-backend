/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class BloodFoundationDonorRepository extends RepositoryBase {
    constructor() {
        super('BloodFoundationDonor')
    }

    async isExists(id) {
        const result = await this.findOne({
            where: { id },
        })

        return !isEmpty(result)
    }

    async socketCreateDonor(props) {}
}

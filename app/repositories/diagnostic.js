/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class DiagnosticRepository extends RepositoryBase {
    constructor() {
        super('Diagnostic')
    }

    async isExists(id) {
        const result = await this.findOne({
            where: { id },
        })

        return !isEmpty(result)
    }
}

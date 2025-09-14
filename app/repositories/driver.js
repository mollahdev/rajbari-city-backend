/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class DriverRepository extends RepositoryBase {
    constructor() {
        super('Driver')
    }
}

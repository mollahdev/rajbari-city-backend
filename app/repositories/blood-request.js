/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class BloodRequestRepository extends RepositoryBase {
    constructor() {
        super('BloodRequest')
    }
}

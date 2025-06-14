/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class HospitalServiceRepository extends RepositoryBase {
    constructor() {
        super('HospitalService')
    }
}

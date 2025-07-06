/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class DoctorAvailabilityRepository extends RepositoryBase {
    constructor() {
        super('DoctorAvailability')
    }
}

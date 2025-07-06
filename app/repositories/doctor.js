/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class DoctorRepository extends RepositoryBase {
    constructor() {
        super('Doctor')
    }
}

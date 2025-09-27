/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class VehicleRepository extends RepositoryBase {
    constructor() {
        super('Vehicle')
    }
}

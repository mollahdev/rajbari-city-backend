/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class DeviceRepository extends RepositoryBase {
    constructor() {
        super('Device')
    }
}

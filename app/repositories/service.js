/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class ServiceRepository extends RepositoryBase {
    constructor() {
        super('Service')
    }
}

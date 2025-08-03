/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class UserRoleRepository extends RepositoryBase {
    constructor() {
        super('UserRole')
    }
}

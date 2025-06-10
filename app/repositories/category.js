/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class CategoryRepository extends RepositoryBase {
    constructor() {
        super('Category')
    }
}

/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class TokenRepository extends RepositoryBase {
    constructor() {
        super('Token')
    }

    async isValid(token) {
        const tokenData = await this.findOne({
            where: {
                token,
            },
        })

        if (tokenData && !tokenData.isValid) {
            return false
        }

        return true
    }
}

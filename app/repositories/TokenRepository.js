/**
 * Internal dependencies
 */
const models = require('./../../models')

class TokenRepository {
    async findBy(column, value) {
        return await models.Token.findOne({ where: { [column]: value } })
    }

    async isTokenValid(token) {
        const tokenData = await this.findBy('token', token)

        if (tokenData && !tokenData.isValid) {
            return false
        }

        return true
    }

    async create(tokenDTO) {
        let data = tokenDTO.toObject()

        const newToken = await models.Token.create(data)
        return newToken.id
    }

    async update(tokenDTO) {
        let data = tokenDTO.toObject()

        return await models.Token.update(data, {
            where: {
                id: tokenDTO.id,
            },
        })
    }

    async delete(id) {
        return await models.Token.destroy({
            where: { id },
        })
    }
}

module.exports = TokenRepository

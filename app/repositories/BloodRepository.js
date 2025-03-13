/**
 * Internal dependencies
 */
const models = require('./../../models')

class BloodRepository {
    async findAllFoundationBy(query) {
        return await models.BloodFoundation.findAll(query)
    }

    async findOneFoundationBy(column, value) {
        return await models.BloodFoundation.findOne({
            where: { [column]: value },
        })
    }

    async createFoundation(foundationDTO) {
        let data = foundationDTO.toObject()

        const newToken = await models.BloodFoundation.create(data)
        return newToken.id
    }
}

module.exports = BloodRepository

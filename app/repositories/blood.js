/**
 * Internal dependencies
 */
const models = require('@/models')
const { isEmpty } = require('lodash')
class BloodRepository {
    async findAllFoundationBy(query) {
        return await models.BloodFoundation.findAll(query)
    }

    async findOneFoundationById(foundationId) {
        return await models.BloodFoundation.findByPk(foundationId)
    }

    async createFoundation(foundationDTO) {
        let data = foundationDTO.toObject()
        return await models.BloodFoundation.create(data)
    }

    async deleteFoundationById(foundationId) {
        return await models.BloodFoundation.destroy({
            where: { id: foundationId },
            individualHooks: true,
        })
    }

    async updateFoundation(foundationDTO) {
        let data = foundationDTO.toObject()
        return await models.BloodFoundation.update(data, {
            where: { id: foundationDTO.id },
        })
    }
}

module.exports = BloodRepository

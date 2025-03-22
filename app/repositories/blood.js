/**
 * Internal dependencies
 */
const models = require('@/models')
const { isEmpty } = require('lodash')
class BloodRepository {
    async createDonor(donorDTO) {
        let data = donorDTO.toObject()
        return await models.BloodDonor.create(data)
    }

    async isAlreadyDonor(userId) {
        const result = await models.BloodDonor.findOne({
            where: { userId },
        })

        return !isEmpty(result)
    }

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

    async deleteDonorById(userId) {
        return await models.BloodDonor.destroy({
            where: { userId },
            individualHooks: true,
        })
    }
}

module.exports = BloodRepository

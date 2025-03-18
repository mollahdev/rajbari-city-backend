/**
 * Internal dependencies
 */
const models = require('./../../models')
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

    async isAlreadyJoinedFoundation(userId, foundationId) {
        const result = await models.BloodFoundationUser.findOne({
            where: { userId, foundationId },
        })

        return !isEmpty(result)
    }

    async findOneFoundationById(foundationId) {
        return await models.BloodFoundation.findByPk(foundationId, {
            include: [
                {
                    model: models.User,
                    as: 'members',
                    attributes: ['id', 'name', 'profilePictureUrl'],
                    through: {
                        // show if status is active or inactive
                        where: { status: ['active', 'inactive'] },
                        attributes: ['status'],
                    },
                    include: [
                        {
                            attributes: [
                                'bloodGroup',
                                'description',
                                'isActive',
                                'lastDonatedAt',
                            ],
                            model: models.BloodDonor,
                            as: 'bloodDonor',
                        },
                    ],
                },
                {
                    model: models.BloodFoundationDonor,
                    as: 'donors',
                    attributes: ['id', 'name', 'profilePictureUrl', 'status'],
                    // i want only active donors
                    where: { status: ['active', 'inactive'] },
                    required: false,
                },
            ],
        })
    }

    async createFoundation(foundationDTO) {
        let data = foundationDTO.toObject()
        return await models.BloodFoundation.create(data)
    }

    async addUserToFoundation(userId, foundationId, role = 'member') {
        // Check if the user and foundation exist
        const user = await models.User.findByPk(userId)
        if (!user) throw new Error('User not found')

        const foundation = await models.BloodFoundation.findByPk(foundationId)
        if (!foundation) throw new Error('Foundation not found')

        return await models.BloodFoundationUser.create({
            userId,
            foundationId,
            role,
        })
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

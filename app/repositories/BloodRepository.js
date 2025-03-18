/**
 * Internal dependencies
 */
const models = require('./../../models')
const { Op } = require('sequelize')

class BloodRepository {
    async findAllFoundationBy(query) {
        return await models.BloodFoundation.findAll(query)
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

    async findManyFoundationByIds(foundationIds) {
        return await models.BloodFoundation.findAll({
            where: { id: foundationIds },
        })
    }

    async createFoundation(foundationDTO) {
        let data = foundationDTO.toObject()

        const newToken = await models.BloodFoundation.create(data)
        return newToken.id
    }

    async addUserToManyFoundations(userId, foundationIds, role = 'member') {
        // Check if the user and foundation exist
        const user = await models.User.findByPk(userId)

        if (!user) throw new Error('User not found')

        // Check if user is already a member
        const existingMembers = await models.BloodFoundationUser.findAll({
            where: { userId, foundationId: foundationIds },
        })

        // skip the existing members
        const existingFoundationIds = existingMembers.map(
            (member) => member.foundationId
        )

        const newFoundationIds = foundationIds.filter(
            (foundationId) => !existingFoundationIds.includes(foundationId)
        )

        // Add user as a member
        return await models.BloodFoundationUser.bulkCreate(
            newFoundationIds.map((foundationId) => ({
                userId,
                foundationId,
                role,
            }))
        )
    }

    async deleteFoundationById(foundationId) {
        return await models.BloodFoundation.destroy({
            where: { id: foundationId },
        })
    }
}

module.exports = BloodRepository

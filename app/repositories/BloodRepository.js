/**
 * Internal dependencies
 */
const models = require('./../../models')

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
                        attributes: ['status', 'role'],
                    },
                },
            ],
        })
    }

    async createFoundation(foundationDTO) {
        let data = foundationDTO.toObject()

        const newToken = await models.BloodFoundation.create(data)
        return newToken.id
    }

    async addUserToFoundation(userId, foundationId, role = 'member') {
        // Check if the user and foundation exist
        const user = await models.User.findByPk(userId)

        if (!user) throw new Error('User not found')

        // Check if user is already a member
        const existingMember = await models.BloodFoundationUser.findOne({
            where: { userId, foundationId },
        })

        if (existingMember) {
            throw new Error('User is already a member')
        }

        // Add user as a member
        return await models.BloodFoundationUser.create({
            userId,
            foundationId,
            role,
        })
    }

    async deleteFoundationById(foundationId) {
        return await models.BloodFoundation.destroy({
            where: { id: foundationId },
        })
    }
}

module.exports = BloodRepository

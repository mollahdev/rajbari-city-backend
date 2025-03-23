/**
 * Internal dependencies
 */
const UserDTO = require('@/app/dtos/user')
const models = require('@/models')

/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')
const { getFileFromPath } = require('@/app/helpers')

class UserRepository {
    async findOneByMobileNumber(mobileNumber) {
        return this.findBy('mobile', mobileNumber)
    }

    async findCurrentUser(id) {
        const result = await models.User.findByPk(id, {
            attributes: {
                exclude: ['password', 'otp', 'otpCreatedAt'],
            },
            include: [
                {
                    model: models.BloodDonor,
                    as: 'bloodDonor',
                    attributes: ['bloodGroup', 'description', 'lastDonatedAt'],
                    required: false,
                },
            ],
        })

        const userData = {
            ...result.dataValues,
            bloodDonor: !!result.bloodDonor,
        }

        return userData
    }

    async findOneById(id) {
        return models.User.findByPk(id, {
            attributes: {
                exclude: ['password', 'otp', 'otpCreatedAt'],
            },
        })
    }

    async findBy(column, value) {
        return await models.User.findOne({ where: { [column]: value } })
    }

    async create(userDTO) {
        let data = userDTO.toObject()

        if (undefined !== userDTO.password) {
            data.password = await bcrypt.hash(userDTO.password, 10) // Hash password
        }

        const newUser = await models.User.create(data)
        return newUser.id
    }
    async update(userDTO) {
        const data = userDTO.toObject()

        data.profilePictureUrl = getFileFromPath(data.profilePictureUrl)

        if (undefined !== userDTO.password) {
            data.password = await bcrypt.hash(userDTO.password, 10) // Hash password
        }

        return await models.User.update(data, {
            where: {
                id: userDTO.id,
            },
        })
    }

    async delete(id) {
        return await models.User.destroy({
            where: { id: id },
        })
    }

    async addOrganization(userId, organizationId, role = 'member') {
        // Check if the user and foundation exist
        const user = await models.User.findByPk(userId)
        if (!user) throw new Error('User not found')

        // check if the user is already joined the organization
        const isAlreadyJoined = await models.OrganizationUser.findOne({
            where: { userId, organizationId },
        })

        if (isAlreadyJoined)
            throw new Error('User already joined the organization')

        return await models.OrganizationUser.create({
            userId,
            organizationId,
            role,
        })
    }
}

module.exports = UserRepository

/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const { getFileFromPath } = require('@/app/helpers')
const models = require('@/models')

module.exports = class UserRepository extends RepositoryBase {
    constructor() {
        super('User')
    }

    async findCurrentUser(id) {
        const self = this
        const result = await self.model.findByPk(id, {
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

    async create(userDTO) {
        let data = userDTO.toObject()

        if (undefined !== userDTO.password) {
            data.password = await bcrypt.hash(userDTO.password, 10) // Hash password
        }

        const newUser = await this.model.create(data)
        return newUser.id
    }

    async update(userDTO, query) {
        const data = userDTO.toObject()

        data.profilePictureUrl = getFileFromPath(data.profilePictureUrl)

        if (undefined !== userDTO.password) {
            data.password = await bcrypt.hash(userDTO.password, 10) // Hash password
        }

        return await this.model.update(data, query)
    }
}

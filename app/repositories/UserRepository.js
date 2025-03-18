/**
 * Internal dependencies
 */
const UserDTO = require('../dtos/UserDTO')
const models = require('./../../models')

/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')

class UserRepository {
    async findOneByMobileNumber(mobileNumber) {
        return this.findBy('mobile', mobileNumber)
    }

    async findOneUserById(id) {
        return models.User.findByPk(id, {
            attributes: {
                exclude: ['password', 'otp', 'otpCreatedAt'],
            },
            include: [
                {
                    model: models.BloodDonor,
                    as: 'bloodDonor',
                    attributes: ['bloodGroup']
                },
                {
                    model: models.BloodFoundation,
                    as: 'bloodFoundations',
                    attributes: ['id'],
                    through: {
                        attributes: [],
                    },
                },
                {
                    model: models.BloodFoundation,
                    as: 'ownedBloodFoundations',
                    attributes: ['id'],
                },
            ],
        })
    }

    async findBy(column, value) {
        return await models.User.findOne({ where: { [column]: value } })
    }

    /**
     * @param {UserDTO} userDTO
     * @returns
     */
    async create(userDTO) {
        let data = userDTO.toObject()

        if (undefined !== userDTO.password) {
            data.password = await bcrypt.hash(userDTO.password, 10) // Hash password
        }

        const newUser = await models.User.create(data)
        return newUser.id
    }

    /**
     * @param {UserDTO} userDTO
     * @returns
     */
    async update(userDTO) {
        let data = userDTO.toObject()

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
}

module.exports = UserRepository

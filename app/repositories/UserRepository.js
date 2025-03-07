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
    async get() {
        return await models.User.findAll()
    }

    async getById(id) {
        return this.findBy('id', id)
    }

    async findOneByMobileNumber(mobileNumber) {
        return this.findBy('mobileNumber', mobileNumber)
    }

    async findBy(column, value) {
        return await models.User.findOne({ where: { [column]: value } })
    }

    /**
     * @param {UserDTO} userDTO
     * @returns
     */
    async create(userDTO) {
        // const hashedPassword = await bcrypt.hash(userDTO.password, 10) // Hash password
        const newUser = await models.User.create(userDTO.toJSON())
        return newUser.id
    }

    /**
     * @param {UserDTO} userDTO
     * @returns
     */
    async update(userDTO) {
        return await models.User.update(userDTO.toJSON(), {
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

const UserDTO = require('../dtos/UserDTO')
const bcrypt = require('bcryptjs')
const models = require('./../../models')

class UserRepository {
    async get() {
        return await models.User.findAll()
    }

    async getById(id) {
        return this.findBy('id', id)
    }

    async findOneByMobileNumber(mobileNumber) {
        return this.findBy('mobile_number', mobileNumber)
    }

    async findBy(column, value) {
        return await models.User.findOne({ where: { [column]: value } })
    }

    /**
     *
     * @param {UserDTO} userDTO
     * @returns
     */
    async create(userDTO) {
        const hashedPassword = await bcrypt.hash(userDTO.password, 10) // Hash password
        const newUser = await models.User.create({
            name: userDTO.name,
            password: hashedPassword,
            mobile_number: userDTO.mobile_number,
        })

        return newUser.id
    }

    async update(id, user) {
        return await models.User.update(user, {
            where: {
                id,
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

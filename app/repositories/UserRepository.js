const UserDTO = require('../dtos/UserDTO')
const bcrypt = require('bcryptjs')
const models = require('./../../models')

class UserRepository {
    async get() {
        return await models.User.findAll()
    }

    async getById(id) {
        return await models.User.findByPk(id)
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

const UserDTO = require('../dtos/UserDTO')
const bcrypt = require('bcryptjs')

class UserRepository {
    constructor(knex) {
        this.knex = knex
    }

    async getAllUsers() {
        return await this.knex('users').select('*')
    }

    async getUserById(id) {
        return await this.knex('users').where({ id }).first()
    }

    /**
     *
     * @param {UserDTO} userDTO
     * @returns
     */
    async createUser(userDTO) {
        const hashedPassword = await bcrypt.hash(userDTO.password, 10) // Hash password
        const newUser = await this.knex('users').insert({
            name: userDTO.name,
            password: hashedPassword,
        })

        return newUser[0]
    }

    async updateUser(id, user) {
        return await this.knex('users').where({ id }).update(user)
    }

    async deleteUser(id) {
        return await this.knex('users').where({ id }).del()
    }
}

module.exports = UserRepository

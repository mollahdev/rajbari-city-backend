const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')

class UserController {
    static async getUsers(request, reply) {
        const userRepository = new UserRepository(request.server.knex)
        const users = await userRepository.getAllUsers()
        return users
    }

    static async getUserById(request, reply) {
        const userRepository = new UserRepository(request.server.knex)
        const user = await userRepository.getUserById(request.params.id)
        return user || { message: 'User not found' }
    }

    static async createUser(request, reply) {
        const { body, server } = request
        const { name, mobile_number, password, date_of_birth, gender, thana } =
            body

        const userDTO = new UserDTO()
        userDTO.name = name
        userDTO.password = 'test'

        const userRepository = new UserRepository(server.knex)
        const userId = await userRepository.createUser(userDTO)

        return { userId, message: 'User created successfully' }
    }

    static async updateUser(request, reply) {
        const userRepository = new UserRepository(request.server.knex)
        await userRepository.updateUser(request.params.id, request.body)
        return { message: 'User updated successfully' }
    }

    static async deleteUser(request, reply) {
        const userRepository = new UserRepository(request.server.knex)
        await userRepository.deleteUser(request.params.id)
        return { message: 'User deleted successfully' }
    }
}

module.exports = UserController

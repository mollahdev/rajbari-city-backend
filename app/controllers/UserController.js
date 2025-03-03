const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')

class UserController {
    static async index(request, reply) {
        const userRepository = new UserRepository()
        const users = await userRepository.get()
        return users
    }

    static async show(request, reply) {
        const userRepository = new UserRepository({})
        const user = await userRepository.getById(request.params.id)
        return user || { message: 'User not found' }
    }

    static async store(request, reply) {
        const { body, server } = request
        const { name, mobile_number, password, date_of_birth, gender, thana } =
            body

        const userDTO = new UserDTO()
        userDTO.name = name
        userDTO.password = 'test'

        const userRepository = new UserRepository()
        const userId = await userRepository.create(userDTO)

        return { userId, message: 'User created successfully' }
    }

    static async update(request, reply) {
        const userRepository = new UserRepository()
        await userRepository.update(request.params.id, request.body)
        return { message: 'User updated successfully' }
    }

    static async delete(request, reply) {
        const userRepository = new UserRepository({})
        await userRepository.delete(request.params.id)
        return { message: 'User deleted successfully' }
    }
}

module.exports = UserController

// controllers/AuthController.js
const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../../config')

class AuthController {
    // User Registration
    async register(request, reply) {
        const { name, mobile_number, password, date_of_birth, gender, thana } =
            request.body

        try {
            const userDTO = new UserDTO()
            userDTO.name = name
            userDTO.mobile_number = mobile_number
            userDTO.password = password
            userDTO.date_of_birth = date_of_birth
            userDTO.gender = gender
            userDTO.thana = thana

            // Validation (basic)
            if (
                !name ||
                !mobile_number ||
                !password ||
                !date_of_birth ||
                !gender ||
                !thana
            ) {
                throw new Error('All fields are required')
            }

            // Check if user exists
            const existingUser =
                await UserRepository.getUserByMobile(mobile_number)
            if (existingUser) {
                throw new Error('Mobile number already exists')
            }

            // Create user
            const newUser = await UserRepository.createUser(userDTO)
            reply
                .status(201)
                .send({
                    message: 'User registered successfully',
                    user: newUser,
                })
        } catch (error) {
            reply.status(400).send({ error: error.message })
        }
    }

    // User Login
    async login(request, reply) {
        const { mobile_number, password } = request.body

        try {
            // Validate the credentials
            const user = await UserRepository.getUserByMobile(mobile_number)
            if (!user) {
                throw new Error('User not found')
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            )
            if (!isPasswordValid) {
                throw new Error('Invalid password')
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, mobile_number: user.mobile_number },
                config.jwtSecret,
                {
                    expiresIn: '1h',
                }
            )

            reply.send({ message: 'Login successful', token })
        } catch (error) {
            reply.status(400).send({ error: error.message })
        }
    }

    // Protected Route
    async protectedRoute(request, reply) {
        reply.send({ message: 'You have access to this route' })
    }
}

module.exports = new AuthController()

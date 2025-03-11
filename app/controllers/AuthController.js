/**
 * Internal dependencies
 */
const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')
const Controller = require('./Controller')
const { now, generateOTP, isOTPResendAllowed } = require('../helpers')
const SMS = require('../sms')
/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class AuthController {
    static async register(request, reply) {
        const { mobile, dialCode, district } = request.body

        try {
            const userRepository = new UserRepository()
            const existingUser =
                await userRepository.findOneByMobileNumber(mobile)

            if (existingUser) {
                if (existingUser.isVerified) {
                    throw new Error('Mobile number already exists')
                }

                // check if 3 minutes passed since last OTP sent
                if (!isOTPResendAllowed(existingUser.otpCreatedAt)) {
                    throw new Error('Please wait some time to resend OTP')
                }
            }

            const otp = generateOTP()
            const message = SMS.registrationTemplate(district, otp)
            await SMS.send(mobile, message)

            const userDTO = new UserDTO()
            userDTO.mobile = mobile
            userDTO.dialCode = dialCode
            userDTO.district = district
            userDTO.otp = otp
            userDTO.otpCreatedAt = now()

            if (existingUser) {
                userDTO.id = existingUser.id
                await userRepository.update(userDTO)
            } else {
                userDTO.id = await userRepository.create(userDTO)
            }

            reply.status(201).send({
                message: 'User registered successfully',
                data: {
                    id: userDTO.id,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async resendOTP(request, reply) {
        const { id } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', id)

            if (!user) {
                throw new Error('User not found')
            }

            if (user.isVerified) {
                throw new Error('User already verified')
            }

            if (!isOTPResendAllowed(user.otpCreatedAt)) {
                throw new Error('Please wait some time to resend OTP')
            }

            const otp = generateOTP()
            const message = SMS.registrationTemplate(user.district, otp)
            await SMS.send(user.mobile, message)

            const userDTO = new UserDTO()
            userDTO.id = id
            userDTO.otp = otp
            userDTO.otpCreatedAt = now()

            await userRepository.update(userDTO)

            reply.send({ message: 'OTP resent successfully' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async verifyOTP(request, reply) {
        const { id, otp } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', id)

            if (!user) {
                throw new Error('User not found')
            }

            if (user.isVerified) {
                reply.send({ message: 'User already verified' })
            }

            if (otp !== user.otp) {
                throw new Error('Wrong OTP')
            }

            const userDTO = new UserDTO()
            userDTO.id = id
            userDTO.isVerified = true // Mark user as verified

            await userRepository.update(userDTO)

            reply.send({ message: 'Verified successfully' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    /**
     * Logs in a user with their mobile number and password.
     * @param {Object} request - The request object containing the mobile number and password.
     * @param {Object} reply - The reply object to send the response.
     * @returns {Object} - Response containing a JWT token on successful login.
     */
    static async login(request, reply) {
        const errors = requestValidator(
            {
                type: 'object',
                properties: {
                    mobileNumber: { type: 'string', minLength: 11 },
                    password: { type: 'string' },
                },
                required: ['mobileNumber', 'password'],
                additionalProperties: false,
            },
            request.body
        )

        if (Array.isArray(errors)) {
            return reply.status(422).send({ errors })
        }

        const { mobileNumber, password } = request.body

        try {
            const userRepository = new UserRepository()
            const user =
                await userRepository.findOneByMobileNumber(mobileNumber)

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

            const token = AuthController.generateJWT(user.id, user.mobileNumber)

            reply.send({ message: 'Login successful', token })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    /**
     * Generates a JWT token for the user.
     * @param {string} userId - The user's ID.
     * @param {string} mobileNumber - The user's mobile number.
     * @returns {string} - The generated JWT token.
     */
    static generateJWT(userId, mobileNumber) {
        return jwt.sign({ id: userId, mobileNumber }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        })
    }
}

module.exports = AuthController

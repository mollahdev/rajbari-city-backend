/**
 * Internal dependencies
 */
const UserRepository = require('../repositories/UserRepository')
const UserDTO = require('../dtos/UserDTO')
const Controller = require('./Controller')
const config = require('../../config')
const { now, sendSMS } = require('../helpers')

/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dayjs = require('dayjs')

class AuthController {
    /**
     * Registers a new user with a mobile number and sends an OTP for verification.
     * @param {Object} request - The request object containing the mobile number.
     * @param {Object} reply - The reply object to send the response.
     * @returns {Object} - Response indicating success or failure.
     */
    static async register(request, reply) {
        const { mobileNumber } = request.body

        try {
            if (!mobileNumber) {
                throw new Error('Mobile number is required')
            }

            const userRepository = new UserRepository()
            const existingUser =
                await userRepository.findOneByMobileNumber(mobileNumber)

            if (existingUser) {
                throw new Error('Mobile number already exists')
            }

            const otp = AuthController.generateAndSendOTP(mobileNumber)

            const userDTO = new UserDTO()
            userDTO.mobileNumber = mobileNumber
            userDTO.otp = otp
            userDTO.otpCreatedAt = now()

            await userRepository.create(userDTO)

            reply.status(201).send({ message: 'User registered successfully' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    /**
     * Resends an OTP to the user's mobile number for verification.
     * @param {Object} request - The request object containing the mobile number.
     * @param {Object} reply - The reply object to send the response.
     * @returns {Object} - Response indicating success or failure.
     */
    static async reSendOTP(request, reply) {
        const { mobileNumber } = request.body

        try {
            if (!mobileNumber) {
                throw new Error('Mobile number is required')
            }

            const userRepository = new UserRepository()
            const user =
                await userRepository.findOneByMobileNumber(mobileNumber)

            if (!user) {
                throw new Error('User not found')
            }

            if (user.isVerified) {
                throw new Error('User already verified')
            }

            if (AuthController.isOTPResendAllowed(user.otpCreatedAt)) {
                throw new Error('Please wait some time to resend OTP')
            }

            const otp = AuthController.generateAndSendOTP(mobileNumber)

            const userDTO = new UserDTO()
            userDTO.id = user.id
            userDTO.otp = otp
            userDTO.otpCreatedAt = now()

            await userRepository.update(userDTO)

            reply.send({ message: 'OTP resent successfully' })
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
        const { mobileNumber, password } = request.body

        try {
            if (!mobileNumber) {
                throw new Error('Mobile number is required')
            }

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
     * Generates an OTP and sends it to the user's mobile number.
     * @param {string} mobileNumber - The mobile number to send the OTP to.
     * @returns {string} - The generated OTP.
     */
    static generateAndSendOTP(mobileNumber) {
        const otp = Math.floor(100000 + Math.random() * 900000)
        sendSMS(mobileNumber, `City app registration OTP: ${otp}`)
        return otp
    }

    /**
     * Checks if OTP resend is allowed based on the last OTP creation time.
     * @param {string} otpCreatedAt - The timestamp when the last OTP was created.
     * @returns {boolean} - True if resend is allowed, otherwise false.
     */
    static isOTPResendAllowed(otpCreatedAt) {
        return dayjs(otpCreatedAt).add(1, 'minute').isAfter(now())
    }

    /**
     * Generates a JWT token for the user.
     * @param {string} userId - The user's ID.
     * @param {string} mobileNumber - The user's mobile number.
     * @returns {string} - The generated JWT token.
     */
    static generateJWT(userId, mobileNumber) {
        return jwt.sign({ id: userId, mobileNumber }, config.jwtSecret, {
            expiresIn: '1h',
        })
    }
}

module.exports = AuthController

/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
/**
 * Internal dependencies
 */
const UserRepository = require('../repositories/UserRepository')
const TokenRepository = require('../repositories/TokenRepository')
const UserDTO = require('../dtos/UserDTO')
const TokenDTO = require('../dtos/TokenDTO')
const Controller = require('./Controller')
const SMS = require('../services/sms')
const Geocode = require('../geocode')
const { now, generateOTP, isOTPResendAllowed } = require('../helpers')

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
                message: 'Successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async verifyOTP(request, reply) {
        const { mobile, otp, dialCode } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findOneByMobileNumber(mobile)

            if (!user) {
                throw new Error('User not found')
            }

            if (otp !== user.otp) {
                throw new Error('Wrong OTP')
            }

            const userDTO = new UserDTO()
            userDTO.id = user.id
            userDTO.otp = null
            userDTO.otpCreatedAt = null
            userDTO.isVerified = true // Mark user as verified

            await userRepository.update(userDTO)
            const token = AuthController.generateTempJWT(user)

            reply.send({
                message: 'Verified successfully',
                data: {
                    temporaryAccessToken: token,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateProfile(request, reply) {
        const { name, password, dob, gender, upazila, union } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', request.user.id)

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified) {
                reply.send({ message: 'User is not verified' })
            }

            if (user.isOnboarded) {
                throw new Error('Profile already updated')
            }

            if (!Geocode.isValid({ district: user.district, upazila, union })) {
                throw new Error('Invalid location')
            }

            const userDTO = new UserDTO()
            userDTO.id = request.user.id
            userDTO.name = name
            userDTO.password = password
            userDTO.dob = dob
            userDTO.gender = gender
            userDTO.upazila = upazila
            userDTO.union = union
            userDTO.isOnboarded = true

            await userRepository.update(userDTO)
            const token = AuthController.generateJWT(user)

            reply.send({
                message: 'Profile updated successfully',
                data: {
                    accessToken: token,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async login(request, reply) {
        const { mobile, dialCode, password } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findOneByMobileNumber(mobile)

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified) {
                throw new Error('User is not verified')
            }

            if (!user.isOnboarded) {
                throw new Error('User profile not updated')
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            )

            if (!isPasswordValid) {
                throw new Error('Invalid password')
            }

            const token = AuthController.generateJWT(user)

            reply.send({
                message: 'Login successful',
                data: {
                    accessToken: token,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async logout(request, reply) {
        const { id, expiresAt, token } = request.user

        try {
            const tokenRepository = new TokenRepository()
            const existingToken = await tokenRepository.findBy('token', token)

            if (existingToken) {
                throw new Error('You are already logged out')
            }

            const tokenDTO = new TokenDTO()
            tokenDTO.token = token
            tokenDTO.expiresAt = expiresAt
            tokenDTO.userId = id

            await tokenRepository.create(tokenDTO)

            reply.send({ message: 'Logout successful' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async forgotPassword(request, reply) {
        const { mobile, dialCode } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findOneByMobileNumber(mobile)

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified) {
                throw new Error('User is not verified')
            }

            if (!user.isOnboarded) {
                throw new Error('User profile not updated')
            }

            if (!isOTPResendAllowed(user.otpCreatedAt)) {
                throw new Error('Please wait some time to resend OTP')
            }

            const otp = generateOTP()
            const message = SMS.forgotPasswordTemplate(user.district, otp)
            await SMS.send(mobile, message)

            const userDTO = new UserDTO()
            userDTO.id = user.id
            userDTO.otp = otp
            userDTO.otpCreatedAt = now()

            await userRepository.update(userDTO)

            reply.send({ message: 'OTP sent successfully' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async resetPassword(request, reply) {
        const { password } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findBy('id', request.user.id)

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified) {
                throw new Error('User is not verified')
            }

            if (!user.isOnboarded) {
                throw new Error('User profile not updated')
            }

            const userDTO = new UserDTO()
            userDTO.id = request.user.id
            userDTO.password = password

            await userRepository.update(userDTO)

            reply.send({ message: 'Password reset successfully' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static generateJWT(user) {
        const data = {
            id: user.id,
            district: user.district,
        }
        return jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })
    }

    static generateTempJWT(user) {
        const data = {
            id: user.id,
        }
        return jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: '10m',
        })
    }
}

module.exports = AuthController

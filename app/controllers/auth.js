/**
 * External dependencies
 */
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const UserRepository = require('@/app/repositories/user')
const TokenRepository = require('@/app/repositories/token')
const DeviceRepository = require('@/app/repositories/device')
const UserDTO = require('@/app/dtos/user')
const TokenDTO = require('@/app/dtos/token')
const SMS = require('@/app/services/sms')
const {
    now,
    generateOTP,
    isOTPResendAllowed,
    convertUnixDateTime,
} = require('@/app/helpers')

class AuthController {
    static async register(request, reply) {
        const { mobile, district } = request.body

        try {
            const userRepository = new UserRepository()
            const existingUser = await userRepository.findOne({
                where: { mobile },
            })

            if (existingUser) {
                if (existingUser.isOnboarded) {
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
            assign(userDTO, {
                ...request.body,
                otp,
                otpCreatedAt: now(),
            })

            if (existingUser) {
                await userRepository.update(userDTO, {
                    where: { id: existingUser.id },
                })
            } else {
                await userRepository.create(userDTO)
            }

            reply.status(201).send({
                message: 'Successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async verifyOTP(request, reply) {
        const { mobile, otp } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findOne({
                where: { mobile },
            })

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

            await userRepository.update(userDTO, {
                where: { id: user.id },
            })
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
        const { union, isMunicipality, municipality } = request.body

        try {
            const tokenDTO = new TokenDTO()
            const userRepository = new UserRepository()
            const tokenRepository = new TokenRepository()
            const user = await userRepository.findOne({
                where: { id: request.user.id },
            })

            if (!user) {
                throw new Error('User not found')
            }

            if (user.isOnboarded || !user.isVerified) {
                throw new Error('Profile already updated or not verified')
            }

            const userDTO = new UserDTO()
            assign(userDTO, {
                ...request.body,
                isOnboarded: true,
            })

            if (isMunicipality) {
                userDTO.isMunicipality = true
                userDTO.municipality = municipality || null
                userDTO.union = null
            } else {
                userDTO.isMunicipality = false
                userDTO.union = union || null
                userDTO.municipality = null
            }

            await userRepository.update(userDTO, {
                where: { id: request.user.id },
            })
            const token = AuthController.generateJWT(user)
            const decodedToken = jwt.decode(token)

            assign(tokenDTO, {
                token,
                userId: user.id,
                expiresAt: convertUnixDateTime(decodedToken.exp),
                isValid: true,
            })

            await tokenRepository.create(tokenDTO)

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
        const { mobile, password } = request.body

        try {
            const tokenDTO = new TokenDTO()
            const tokenRepository = new TokenRepository()
            const userRepository = new UserRepository()
            const user = await userRepository.findOne({
                where: { mobile },
            })

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified || !user.isOnboarded) {
                throw new Error('User is not verified or onboarded')
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            )

            if (!isPasswordValid) {
                throw new Error('Invalid password')
            }

            const token = AuthController.generateJWT(user)
            const decodedToken = jwt.decode(token)
            assign(tokenDTO, {
                token,
                userId: user.id,
                expiresAt: convertUnixDateTime(decodedToken.exp),
                isValid: true,
            })

            await tokenRepository.create(tokenDTO)

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
        const { deviceToken } = request.body

        try {
            const tokenDTO = new TokenDTO()
            const tokenRepository = new TokenRepository()
            const deviceRepository = new DeviceRepository()
            const existingToken = await tokenRepository.findOne({
                where: { token },
            })

            if (!existingToken) {
                assign(tokenDTO, {
                    token,
                    expiresAt,
                    userId: id,
                    isValid: false,
                })

                await tokenRepository.create(tokenDTO)
            }

            tokenDTO.isValid = false
            await tokenRepository.update(tokenDTO, {
                where: { token, userId: id },
            })

            const deviceWhereTable = {
                userId: id,
            }

            if (deviceToken) {
                deviceWhereTable.token = deviceToken
            }

            await deviceRepository.destroy({
                where: deviceWhereTable,
            })

            reply.send({ message: 'Logout successful' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async forgotPassword(request, reply) {
        const { mobile } = request.body

        try {
            const userRepository = new UserRepository()
            const user = await userRepository.findOne({
                where: { mobile },
            })

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified || !user.isOnboarded) {
                throw new Error('User is not verified or onboarded')
            }

            if (!isOTPResendAllowed(user.otpCreatedAt)) {
                throw new Error('Please wait some time to resend OTP')
            }

            const otp = generateOTP()
            const message = SMS.forgotPasswordTemplate(user.district, otp)
            await SMS.send(mobile, message)

            const userDTO = new UserDTO()
            userDTO.otp = otp
            userDTO.otpCreatedAt = now()

            await userRepository.update(userDTO, {
                where: { id: user.id },
            })

            reply.send({ message: 'OTP sent successfully' })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async resetPassword(request, reply) {
        const { password } = request.body

        try {
            const tokenDTO = new TokenDTO()
            const tokenRepository = new TokenRepository()
            const userRepository = new UserRepository()
            const user = await userRepository.findOne({
                where: { id: request.user.id },
            })

            if (!user) {
                throw new Error('User not found')
            }

            if (!user.isVerified || !user.isOnboarded) {
                throw new Error('User is not verified or onboarded')
            }

            const userDTO = new UserDTO()
            userDTO.password = password

            await userRepository.update(userDTO, {
                where: { id: request.user.id },
            })

            assign(tokenDTO, {
                isValid: false,
            })

            await tokenRepository.update(tokenDTO, {
                where: { userId: request.user.id },
            })

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
            expiresIn: '1y',
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

const AuthController = require('@/app/controllers/auth')
const auth = require('@/app/middleware/auth')
const { validateBody } = require('@/app/helpers/validation')
const { updateProfileSchema } = require('./index.schema')

module.exports = async function (routes) {
    routes.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['mobile', 'dialCode', 'district'],
                properties: {
                    mobile: {
                        type: 'string',
                        pattern: '^[1][0-9]{9}$',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                    },
                    district: {
                        type: 'string',
                        enum: ['49'],
                    },
                },
            },
        },
        handler: AuthController.register,
    })

    routes.post('/verify-otp', {
        schema: {
            body: {
                type: 'object',
                required: ['mobile', 'dialCode', 'otp'],
                properties: {
                    mobile: {
                        type: 'string',
                        pattern: '^[1][0-9]{9}$',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                    },
                    otp: {
                        type: 'string',
                        pattern: '^[0-9]{6}$',
                    },
                },
            },
        },
        handler: AuthController.verifyOTP,
    })

    routes.patch('/update-profile', {
        preValidation: validateBody(updateProfileSchema),
        preHandler: auth,
        handler: AuthController.updateProfile,
    })

    routes.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['mobile', 'dialCode', 'password'],
                properties: {
                    mobile: {
                        type: 'string',
                        pattern: '^[1][0-9]{9}$',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                    },
                    password: {
                        type: 'string',
                    },
                },
            },
        },
        handler: AuthController.login,
    })

    routes.post('/logout', {
        preHandler: auth,
        schema: {
            body: {
                type: 'object',
                properties: {
                    deviceToken: {
                        type: 'string',
                        minLength: 1,
                    },
                },
            },
        },
        handler: AuthController.logout,
    })

    routes.post('/forgot-password', {
        schema: {
            body: {
                type: 'object',
                required: ['mobile', 'dialCode'],
                properties: {
                    mobile: {
                        type: 'string',
                        pattern: '^[1][0-9]{9}$',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                    },
                },
            },
        },
        handler: AuthController.forgotPassword,
    })

    routes.put('/reset-password', {
        schema: {
            body: {
                type: 'object',
                required: ['password'],
                properties: {
                    password: {
                        type: 'string',
                        minLength: 4,
                    },
                },
            },
        },
        preHandler: auth,
        handler: AuthController.resetPassword,
    })
}

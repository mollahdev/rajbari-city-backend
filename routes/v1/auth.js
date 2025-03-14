const AuthController = require('../../app/controllers/AuthController')
const auth = require('../../app/middleware/auth')

module.exports = async function (routes) {
    routes.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['mobile', 'dialCode', 'district'],
                properties: {
                    mobile: {
                        type: 'string',
                        pattern: '^[0-9]{10}$',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                    },
                    district: {
                        type: 'string',
                        enum: ['5', '49'],
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
                        pattern: '^[0-9]{10}$',
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
        schema: {
            body: {
                type: 'object',
                required: [
                    'name',
                    'password',
                    'dob',
                    'gender',
                    'upazila',
                    'union',
                ],
                properties: {
                    name: {
                        type: 'string',
                    },
                    password: {
                        type: 'string',
                        minLength: 4,
                    },
                    dob: {
                        type: 'string',
                    },
                    gender: {
                        type: 'string',
                        enum: ['male', 'female'],
                    },
                    upazila: {
                        type: 'string',
                    },
                    union: {
                        type: 'string',
                    },
                },
            },
        },
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
                        pattern: '^[0-9]{10}$',
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

    routes.get('/logout', {
        preHandler: auth,
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
                        pattern: '^[0-9]{10}$',
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

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
                        description:
                            'Must be a string containing exactly 10 digits',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                        description: "Must be the string '880'",
                    },
                    district: {
                        type: 'string',
                        enum: ['5', '49'],
                        description: 'Must be a valid district',
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
                        description:
                            'Must be a string containing exactly 10 digits',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                        description: "Must be the string '880'",
                    },
                    otp: {
                        type: 'string',
                        pattern: '^[0-9]{6}$',
                        description:
                            'Must be a string containing exactly 6 digits',
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
                        description: 'Name of the user',
                    },
                    password: {
                        type: 'string',
                        description: 'Password of the user',
                        minLength: 4,
                    },
                    dob: {
                        type: 'string',
                        description: 'Date of birth of the user',
                    },
                    gender: {
                        type: 'string',
                        enum: ['male', 'female'],
                        description: 'Gender of the user',
                    },
                    upazila: {
                        type: 'string',
                        description: 'Upazila of the user',
                    },
                    union: {
                        type: 'string',
                        description: 'Union of the user',
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
                        description:
                            'Must be a string containing exactly 10 digits',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                        description: "Must be the string '880'",
                    },
                    password: {
                        type: 'string',
                        description: 'Password of the user',
                    },
                },
            },
        },
        handler: AuthController.login,
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
                        description:
                            'Must be a string containing exactly 10 digits',
                    },
                    dialCode: {
                        type: 'string',
                        enum: ['880'],
                        description: "Must be the string '880'",
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
                        description: 'Password of the user',
                    },
                },
            },
        },
        preHandler: auth,
        handler: AuthController.resetPassword,
    })
}

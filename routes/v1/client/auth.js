const AuthController = require('../../../app/controllers/AuthController')

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

    routes.post('/resend-otp', {
        schema: {
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'User id is required to resend OTP',
                    },
                },
            },
        },
        handler: AuthController.resendOTP,
    })

    routes.post('/verify-otp', {
        schema: {
            body: {
                type: 'object',
                required: ['id', 'otp'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'User id is required to resend OTP',
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
    // routes.post('/login', AuthController.login)
}

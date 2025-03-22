const ProfileController = require('../../app/controllers/ProfileController')
const auth = require('../../app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/', {
        handler: ProfileController.getCurrentProfile,
    })

    routes.delete('/', {
        handler: ProfileController.deleteCurrentProfile,
    })

    routes.patch('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    dob: {
                        type: 'string',
                    },
                    profilePictureFile: {
                        type: 'string',
                    },
                    gender: {
                        type: 'string',
                        enum: ['male', 'female'],
                    },
                    upazila: {
                        type: 'string',
                    },
                    isMunicipality: {
                        type: 'boolean',
                    },
                    municipality: {
                        type: 'string',
                    },
                    union: {
                        type: 'string',
                    },
                },
            },
        },
        handler: ProfileController.updateProfile,
    })

    routes.post('/password', {
        schema: {
            body: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                    oldPassword: {
                        type: 'string',
                        description: 'Old password of the user',
                        minLength: 4,
                    },
                    newPassword: {
                        type: 'string',
                        description: 'New password of the user',
                        minLength: 4,
                    },
                },
            },
        },
        handler: ProfileController.updatePassword,
    })

    routes.addHook('onRequest', auth) //Middleware
}

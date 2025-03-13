const ProfileController = require('../../app/controllers/ProfileController')
const auth = require('../../app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/', {
        handler: ProfileController.getCurrentProfile,
    })

    routes.patch('/', {
        schema: {
            body: {
                type: 'object',
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
        handler: ProfileController.updateProfile,
    })

    routes.addHook('onRequest', auth) //Middleware
}

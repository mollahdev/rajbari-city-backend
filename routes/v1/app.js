const AppController = require('@/app/controllers/app')
const auth = require('@/app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/', {
        handler: AppController.getAppInfo,
    })

    routes.get('/release', {
        handler: AppController.getReleaseInfo,
    })

    routes.post('/device', {
        preHandler: auth,
        schema: {
            body: {
                type: 'object',
                required: ['token', 'platformType'],
                properties: {
                    token: {
                        type: 'string',
                        minLength: 1,
                    },
                    platformType: {
                        type: 'string',
                        enum: ['android', 'ios', 'web'],
                    },
                },
            },
        },
        handler: AppController.registerDevice,
    })

    routes.get('/location', {
        handler: AppController.location,
    })
}

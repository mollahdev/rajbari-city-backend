const BloodController = require('../../app/controllers/BloodController')
const auth = require('../../app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.post('/foundation', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'mobiles', 'socials', 'upazila', 'union'],
                properties: {
                    name: { type: 'string' },
                    thumbnailUrl: { type: 'string' },
                    description: { type: 'string' },
                    mobiles: { type: 'array' },
                    socials: { type: 'array' },
                    upazila: { type: 'string' },
                    union: { type: 'string' },
                },
            },
        },
        handler: BloodController.createFoundation,
    })

    routes.addHook('onRequest', auth) //Middleware
}

const BloodController = require('../../app/controllers/BloodController')
const auth = require('../../app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.get('/foundation/:id', {
        handler: BloodController.getOneFoundation,
    })

    routes.delete('/foundation/:id', {
        handler: BloodController.deleteOneFoundation,
    })

    routes.post('/foundation', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'mobiles', 'socials', 'upazila', 'isMunicipality'],
                properties: {
                    name: { type: 'string' },
                    thumbnailUrl: { type: 'string' },
                    description: { type: 'string' },
                    mobiles: { type: 'array' },
                    socials: { type: 'array' },
                    upazila: { type: 'string' },
                    isMunicipality: {
                        type: 'boolean',
                    },
                    municipality: {
                        type: 'string',
                    },
                    union: { type: 'string' },
                },
            },
        },
        handler: BloodController.createFoundation,
    })

    routes.post('/join-foundation', {
        schema: {
            body: {
                type: 'object',
                required: ['foundationId'],
                properties: {
                    foundationId: { type: 'string' },
                },
            },
        },
        handler: BloodController.joinFoundation,
    })

    routes.addHook('onRequest', auth) //Middleware
}

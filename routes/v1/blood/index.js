const auth = require('@/app/middleware/auth')
const BloodController = require('@/app/controllers/blood')

module.exports = async function (routes) {
    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.get('/foundation/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: BloodController.getFoundationDetails,
    })

    routes.get('/foundation/:id/join', {
        handler: BloodController.joinFoundation,
    })

    routes.get('/donors', {
        handler: BloodController.getAllDonors,
    })

    routes.addHook('onRequest', auth) //Middleware
}

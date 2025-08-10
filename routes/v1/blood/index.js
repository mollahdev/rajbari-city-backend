const auth = require('@/app/middleware/auth')
const BloodController = require('@/app/controllers/blood')
const { validateQuery } = require('@/app/helpers/validation')
const {
    bloodDonorListSchema,
    bloodRequestListSchema,
} = require('./index.schema')

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

    routes.get('/foundation/:id/donors', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: BloodController.getAllFoundationsDonors,
    })

    routes.get('/donors', {
        preValidation: validateQuery(bloodDonorListSchema),
        handler: BloodController.getAllDonors,
    })

    routes.get('/blood-requests', {
        preValidation: validateQuery(bloodRequestListSchema),
        handler: BloodController.getAllBloodRequests,
    })

    routes.get('/blood-request/:id', {
        handler: BloodController.getBloodRequestDetails,
    })

    routes.addHook('onRequest', auth) //Middleware
}

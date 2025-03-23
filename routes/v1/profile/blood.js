const { BloodController } = require('@/app/controllers/profile')
const {
    foundationCreateSchema,
    foundationUpdateSchema,
    foundationJoinSchema,
    createDonorSchema,
    updateDonorSchema,
} = require('./blood.schema')

const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    /**
     * Blood donor routes
     */
    routes.post('/donor', {
        preValidation: validateBody(createDonorSchema),
        handler: BloodController.createDonor,
    })

    routes.get('/donor', {
        handler: BloodController.getDonorDetails,
    })

    routes.delete('/donor', {
        handler: BloodController.deleteDonor,
    })

    routes.patch('/donor', {
        preValidation: validateBody(updateDonorSchema),
        handler: BloodController.updateDonorDetails,
    })

    /**
     * Blood foundation routes
     */
    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.get('/foundation/:id', {
        handler: BloodController.getFoundationDetails,
    })

    routes.patch('/foundation/:id', {
        preValidation: validateBody(foundationUpdateSchema),
        handler: BloodController.updateFoundationDetails,
    })

    routes.delete('/foundation/:id', {
        handler: BloodController.deleteOneFoundation,
    })

    routes.post('/foundation', {
        preValidation: validateBody(foundationCreateSchema),
        handler: BloodController.createFoundation,
    })

    routes.post('/join-foundation', {
        preValidation: validateBody(foundationJoinSchema),
        handler: BloodController.joinFoundation,
    })
}

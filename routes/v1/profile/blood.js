const { BloodController } = require('@/app/controllers/profile')
const {
    foundationCreateSchema,
    foundationUpdateSchema,
    createDonorSchema,
    updateDonorSchema,
    foundationDonorSchema,
    bloodFoundationDonorListSchema,
    createBloodRequestSchema,
    updateBloodRequestSchema,
    inviteForFoundationAccessSchema,
    updateFoundationAccessSchema,
} = require('./blood.schema')

const { validateBody, validateQuery } = require('@/app/helpers/validation')

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
     * Blood request routes
     */
    routes.post('/request', {
        preValidation: validateBody(createBloodRequestSchema),
        handler: BloodController.createBloodRequest,
    })

    routes.get('/request/:id', {
        handler: BloodController.getBloodRequestDetails,
    })

    routes.delete('/request/:id', {
        handler: BloodController.deleteBloodRequest,
    })

    routes.patch('/request/:id', {
        preValidation: validateBody(updateBloodRequestSchema),
        handler: BloodController.updateBloodRequest,
    })

    routes.get('/request-list', {
        handler: BloodController.getBloodRequestList,
    })

    /**
     * Blood foundation routes
     */
    routes.post('/foundation', {
        preValidation: validateBody(foundationCreateSchema),
        handler: BloodController.createFoundation,
    })

    routes.get('/foundation/:id', {
        handler: BloodController.getFoundationDetails,
    })

    routes.patch('/foundation/:id', {
        preValidation: validateBody(foundationUpdateSchema),
        handler: BloodController.updateFoundationDetails,
    })

    routes.delete('/foundation/:id', {
        handler: BloodController.deleteFoundation,
    })

    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.post('/foundation/:id/donor', {
        preValidation: validateBody(foundationDonorSchema),
        handler: BloodController.addFoundationDonor,
    })

    routes.patch('/foundation/:foundationId/donor/:donorId', {
        handler: BloodController.updateFoundationDonor,
    })

    routes.delete('/foundation/:foundationId/donor/:donorId', {
        handler: BloodController.deleteFoundationDonor,
    })

    routes.get('/foundation/:foundationId/donor-list', {
        preValidation: validateQuery(bloodFoundationDonorListSchema),
        handler: BloodController.getFoundationDonorList,
    })

    routes.post('/foundation/access/invite', {
        preValidation: validateBody(inviteForFoundationAccessSchema),
        handler: BloodController.shareFoundationAccess,
    })

    routes.patch('/foundation/access/:id', {
        preValidation: validateBody(updateFoundationAccessSchema),
        handler: BloodController.updateFoundationAccess,
    })

    routes.delete('/foundation/access/:id', {
        handler: BloodController.deleteFoundationAccess,
    })

    routes.get('/foundation/:foundationId/access-list', {
        handler: BloodController.getFoundationAccessList,
    })
}

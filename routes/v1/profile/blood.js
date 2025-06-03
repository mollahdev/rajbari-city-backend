const { BloodController } = require('@/app/controllers/profile')
const {
    foundationCreateSchema,
    foundationUpdateSchema,
    createDonorSchema,
    updateDonorSchema,
    foundationDonorSchema,
    bloodFoundationMemberSchema,
    bloodFoundationMemberStatusSchema,
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
        handler: BloodController.deleteOneFoundation,
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
        handler: BloodController.getFoundationDonorList,
    })

    routes.get('/foundation/:foundationId/member-list', {
        preValidation: validateQuery(bloodFoundationMemberSchema),
        handler: BloodController.getFoundationMemberList,
    })

    routes.patch('/foundation/:foundationId/member/:memberId', {
        preValidation: validateBody(bloodFoundationMemberStatusSchema),
        handler: BloodController.updateFoundationMember,
    })

    routes.delete('/foundation/:foundationId/member/:memberId', {
        handler: BloodController.deleteFoundationMember,
    })
}

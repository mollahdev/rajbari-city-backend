const authFoundationWebsite = require('@/app/middleware/auth-foundation-website')
const FoundationWebsite = require('@/app/controllers/foundation-website')
const FileController = require('@/app/controllers/file')
const {
    bloodDonorListSchema,
    foundationDonorSchema,
} = require('./index.schema')
const { validateQuery, validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.get('/donor-short-list', {
        handler: FoundationWebsite.donorShortList,
    })

    routes.get('/donor-list', {
        preValidation: validateQuery(bloodDonorListSchema),
        handler: FoundationWebsite.donorList,
    })

    routes.get('/locations', {
        handler: FoundationWebsite.locations,
    })

    routes.post('/donor-registration', {
        preValidation: validateBody(foundationDonorSchema),
        handler: FoundationWebsite.createDonor,
    })

    routes.post('/upload', {
        handler: FileController.upload,
    })

    routes.addHook('onRequest', authFoundationWebsite)
}

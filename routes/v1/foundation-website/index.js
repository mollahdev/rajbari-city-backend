const authFoundationWebsite = require('@/app/middleware/auth-foundation-website')
const FoundationWebsite = require('@/app/controllers/foundation-website')
const { bloodDonorListSchema } = require('./index.schema')
const { validateQuery } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.get('/donor-short-list', {
        handler: FoundationWebsite.donorShortList,
    })

    routes.get('/donor-list', {
        preValidation: validateQuery(bloodDonorListSchema),
        handler: FoundationWebsite.donorList,
    })

    routes.addHook('onRequest', authFoundationWebsite)
}

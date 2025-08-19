const authFoundationWebsite = require('@/app/middleware/auth-foundation-website')
const FoundationWebsite = require('@/app/controllers/foundation-website')

module.exports = async function (routes) {
    routes.get('/donor-short-list', {
        handler: FoundationWebsite.donorShortList,
    })

    routes.get('/donor-list', {
        handler: FoundationWebsite.donorList,
    })

    routes.addHook('onRequest', authFoundationWebsite)
}

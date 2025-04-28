const auth = require('@/app/middleware/auth')
const BloodController = require('@/app/controllers/blood')

module.exports = async function (routes) {
    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.get('/foundation/:id', {
        handler: BloodController.getFoundationDetails,
    })

    routes.addHook('onRequest', auth) //Middleware
}

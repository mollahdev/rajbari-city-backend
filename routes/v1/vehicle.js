const VehicleController = require('@/app/controllers/vehicle')
const auth = require('@/app/middleware/auth')

module.exports = async function (fastify) {
    fastify.get('/', {
        handler: VehicleController.getAllVehicles,
    })

    fastify.get('/:id', {
        handler: VehicleController.getVehicleDetails,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

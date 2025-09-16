const { VehicleController } = require('@/app/controllers/profile')
const { vehicleSchema } = require('./vehicle.schema')

const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.post('/', {
        preHandler: validateBody(vehicleSchema),
        handler: VehicleController.createVehicle,
    })

    routes.get('/', {
        handler: VehicleController.getAllVehicles,
    })

    routes.get('/:id', {
        handler: VehicleController.getVehicleDetails,
    })

    routes.patch('/:id', {
        preHandler: validateBody(vehicleSchema),
        handler: VehicleController.updateVehicle,
    })

    routes.delete('/:id', {
        handler: VehicleController.deleteVehicle,
    })
}

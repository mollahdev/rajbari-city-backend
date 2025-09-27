const { DriverController } = require('@/app/controllers/profile')
const { driverSchema } = require('./driver.schema')
const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.post('/', {
        preHandler: validateBody(driverSchema),
        handler: DriverController.createDriver,
    })

    routes.get('/', {
        handler: DriverController.getDriverDetails,
    })

    routes.patch('/', {
        preHandler: validateBody(driverSchema),
        handler: DriverController.updateDriverDetails,
    })

    routes.delete('/', {
        handler: DriverController.deleteDriver,
    })
}

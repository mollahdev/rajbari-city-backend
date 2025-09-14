const { DriverController } = require('@/app/controllers/profile')
const { doctorSchema } = require('./doctor.schema')

const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.get('/', {
        handler: DriverController.getDriverDetails,
    })
}

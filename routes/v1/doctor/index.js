const DoctorController = require('@/app/controllers/doctor')
const auth = require('@/app/middleware/auth')

module.exports = async function (fastify) {
    fastify.get('/', {
        handler: DoctorController.getAllDoctors,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

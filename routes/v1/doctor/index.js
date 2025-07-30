const DoctorController = require('@/app/controllers/doctor')
const auth = require('@/app/middleware/auth')
const { doctorListQuerySchema } = require('./index.schema')
const { validateQuery } = require('@/app/helpers/validation')

module.exports = async function (fastify) {
    fastify.get('/', {
        preValidation: validateQuery(doctorListQuerySchema),
        handler: DoctorController.getAllDoctors,
    })

    fastify.get('/:id', {
        handler: DoctorController.getDoctorDetails,
    })

    fastify.get('/category', {
        handler: DoctorController.getDoctorCategory,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

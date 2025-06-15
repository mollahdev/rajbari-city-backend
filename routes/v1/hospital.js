const HospitalController = require('@/app/controllers/hospital')
const auth = require('@/app/middleware/auth')

module.exports = async function (fastify) {
    fastify.get('/', {
        handler: HospitalController.getAllHospitals,
    })

    fastify.get('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
        handler: HospitalController.getHospitalDetails,
    })

    // ToDo: Super Admin Only support is not implemented yet
    fastify.addHook('onRequest', auth) //Middleware
}

const { HospitalController } = require('@/app/controllers/profile')
const { hospitalSchema } = require('./hospital.schema')

const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.post('/', {
        preValidation: validateBody(hospitalSchema),
        handler: HospitalController.createHospital,
    })

    routes.patch('/:id', {
        preValidation: validateBody(hospitalSchema),
        handler: HospitalController.updateHospitalDetails,
    })

    routes.get('/', {
        handler: HospitalController.getAllHospitals,
    })

    routes.get('/:id', {
        handler: HospitalController.getHospitalDetails,
    })

    routes.delete('/:id', {
        handler: HospitalController.deleteOneHospital,
    })
}

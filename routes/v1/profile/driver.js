const { DoctorController } = require('@/app/controllers/profile')
const { doctorSchema } = require('./doctor.schema')

const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.post('/', {
        preValidation: validateBody(doctorSchema),
        handler: DoctorController.createDoctor,
    })

    routes.patch('/:id', {
        preValidation: validateBody(doctorSchema),
        handler: DoctorController.updateDoctorDetails,
    })

    routes.get('/', {
        handler: DoctorController.getDoctorList,
    })

    routes.get('/:id', {
        handler: DoctorController.getDoctorDetails,
    })

    routes.delete('/:id', {
        handler: DoctorController.deleteDoctor,
    })
}

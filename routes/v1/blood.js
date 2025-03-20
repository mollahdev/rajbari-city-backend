const BloodController = require('../../app/controllers/BloodController')
const auth = require('../../app/middleware/auth')
const {
    foundationCreateSchema,
    foundationJoinSchema,
    createDonorSchema,
} = require('./blood.schema')

const { validateBody } = require('../../app/helpers/validation')

module.exports = async function (routes) {
    routes.post('/donor', {
        preValidation: validateBody(createDonorSchema),
        handler: BloodController.createDonor,
    })

    routes.delete('/donor', {
        handler: BloodController.deleteDonor,
    })

    routes.get('/foundations', {
        handler: BloodController.getAllFoundations,
    })

    routes.get('/foundation/:id', {
        handler: BloodController.getOneFoundation,
    })

    routes.delete('/foundation/:id', {
        handler: BloodController.deleteOneFoundation,
    })

    routes.post('/foundation', {
        preValidation: validateBody(foundationCreateSchema),
        handler: BloodController.createFoundation,
    })

    routes.post('/join-foundation', {
        preValidation: validateBody(foundationJoinSchema),
        handler: BloodController.joinFoundation,
    })

    routes.addHook('onRequest', auth) //Middleware
}

const { DiagnosticController } = require('@/app/controllers/profile')
const { diagnosticSchema } = require('./diagnostic.schema')

const { validateBody } = require('@/app/helpers/validation')

module.exports = async function (routes) {
    routes.post('/', {
        preValidation: validateBody(diagnosticSchema),
        handler: DiagnosticController.createDiagnostic,
    })

    routes.patch('/:id', {
        preValidation: validateBody(diagnosticSchema),
        handler: DiagnosticController.updateDiagnosticDetails,
    })

    routes.get('/', {
        handler: DiagnosticController.getAllDiagnostics,
    })

    routes.get('/:id', {
        handler: DiagnosticController.getDiagnosticDetails,
    })

    routes.delete('/:id', {
        handler: DiagnosticController.deleteOneDiagnostic,
    })
}

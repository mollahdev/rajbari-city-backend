const FileController = require('@/app/controllers/file')
const auth = require('@/app/middleware/auth')

module.exports = async function (routes) {
    routes.post('/upload', {
        handler: FileController.upload,
    })

    routes.addHook('onRequest', auth) //Middleware
}

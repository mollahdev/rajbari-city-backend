const UserController = require('@/app/controllers/user')
const auth = require('@/app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/:mobile', {
        handler: UserController.getUserByMobile,
    })

    routes.addHook('onRequest', auth) //Middleware
}

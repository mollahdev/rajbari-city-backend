const AccessController = require('@/app/controllers/profile/access')

module.exports = async function (routes) {
    routes.get('/:id/accept', {
        handler: AccessController.acceptAccess,
    })

    routes.get('/:id/reject', {
        handler: AccessController.rejectAccess,
    })

    routes.get('/invitations', {
        handler: AccessController.getInvitationList,
    })
}

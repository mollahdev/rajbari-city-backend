const NotificationController = require('@/app/controllers/notification')

module.exports = async function (routes) {
    routes.get('/', {
        handler: NotificationController.getAllNotification,
    })

    routes.post('/read', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    ids: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                    },
                },
                required: ['ids'],
            },
        },
        handler: NotificationController.markAsRead,
    })
}

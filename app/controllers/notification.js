const { uniq } = require('lodash')
const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const NotificationUserDTO = require('@/app/dtos/notification-user')
const NotificationUserRepository = require('@/app/repositories/notification-user')
const NotificationRepository = require('@/app/repositories/notification')
const { getDateTimeAdd } = require('@/app/helpers')

class NotificationController extends Controller {
    static async getAllNotification(request, reply) {
        const { id } = request.user
        try {
            const notificationRepo = new NotificationRepository()
            const notificationUserRepo = new NotificationUserRepository()
            const notificationUser = await notificationUserRepo.findAll({
                where: {
                    userId: id,
                    createdAt: {
                        [Op.gte]: getDateTimeAdd(-30, 'day'),
                    },
                },
                order: [['createdAt', 'DESC']],
            })

            const notificationIds = uniq(
                notificationUser.map((n) => n.notificationId)
            )

            const notifications = await notificationRepo.findAll({
                where: {
                    id: {
                        [Op.in]: notificationIds,
                    },
                },
            })

            const result = []
            notificationUser.forEach((item) => {
                const notification = notifications.find(
                    (n) => n.id === item.notificationId
                )
                if (notification) {
                    result.push({
                        type: notification.type,
                        priority: 'normal',
                        title: notification.title,
                        body: notification.body,
                        data: {
                            ...(notification.data || {}),
                            notification: item.dataValues,
                        },
                    })
                }
            })

            reply.send({
                message: 'Retrieved successfully',
                data: result,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async markAsRead(request, reply) {
        const { ids } = request.body
        const notificationIds = uniq(ids || [])

        try {
            const notificationUserDTO = new NotificationUserDTO()
            const notificationUserRepo = new NotificationUserRepository()

            notificationUserDTO.read = true
            await notificationUserRepo.update(notificationUserDTO, {
                where: {
                    id: {
                        [Op.in]: notificationIds,
                    },
                },
            })

            reply.send({
                message: 'Notifications marked as read',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = NotificationController

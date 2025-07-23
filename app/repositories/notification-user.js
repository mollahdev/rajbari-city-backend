/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
const { Expo } = require('expo-server-sdk')
const expo = new Expo()
const { Op } = require('sequelize')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const DeviceRepository = require('@/app/repositories/device')
const NotificationUserDTO = require('@/app/dtos/notification-user')
const { RECEIVE } = require('@/socket/events')

module.exports = class NotificationUserRepository extends RepositoryBase {
    constructor() {
        super('NotificationUser')
    }

    async createReceiverPayload(props) {
        const { notificationId, receivers } = props
        try {
            const bulkDTOs = receivers.map((receiver) => {
                const notificationUserDTO = new NotificationUserDTO()
                notificationUserDTO.notificationId = notificationId
                notificationUserDTO.userId = receiver
                notificationUserDTO.read = false
                notificationUserDTO.archived = false
                return notificationUserDTO
            })

            const response = await this.model.bulkCreate(bulkDTOs)
            return response.map((item) => item.id)
        } catch (error) {
            console.error('Error in createNotificationUser', error)
        }
    }

    async sendPushNotification(props) {
        const { receiverData, notificationData, priority } = props
        try {
            const receiverUserIds = receiverData.map((item) => item.userId)
            const deviceRepo = new DeviceRepository()

            const devices = await deviceRepo.findAll({
                where: {
                    userId: { [Op.in]: receiverUserIds },
                },
                attributes: ['token', 'platformType', 'userId'],
            })

            if (isEmpty(devices)) return
            const messages = devices.map((device) => {
                const notification = receiverData.find(
                    (item) => item.userId === device.userId
                )

                return {
                    to: device.token,
                    sound: 'default',
                    priority: priority || 'normal',
                    channelId: 'bdCitiesNotification',
                    title: notificationData.title,
                    body: notificationData.body,
                    data: {
                        ...(notificationData.data || {}),
                        notification: notification.dataValues,
                    },
                }
            })

            const chunks = expo.chunkPushNotifications(messages)
            for (let chunk of chunks) {
                try {
                    await expo.sendPushNotificationsAsync(chunk)
                } catch (error) {
                    console.error('Error sending notification', error)
                }
            }
        } catch (error) {
            console.error('Error in sendPushNotification', error)
        }
    }

    async sendSocketNotification(props) {
        const { receiverData, notificationData, socket, priority } = props
        try {
            receiverData.forEach((receiver) => {
                socket
                    .to(`user.${receiver.userId}`)
                    .emit(RECEIVE.NOTIFICATION, {
                        type: notificationData.type,
                        priority: priority || 'normal',
                        title: notificationData.title,
                        body: notificationData.body,
                        data: {
                            ...(notificationData.data || {}),
                            notification: receiver.dataValues,
                        },
                    })
            })
        } catch (error) {
            console.error('Error in sendSocketNotification', error)
        }
    }
}

const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const NotificationUserRepository = require('./notification-user')
const NotificationDTO = require('@/app/dtos/notification')
const { banglaRole } = require('@/app/helpers')

module.exports = class NotificationRepository extends RepositoryBase {
    constructor() {
        super('Notification')
    }

    async #createNotification(props) {
        const { receivers, notificationDTO } = props

        try {
            const notificationUserRepo = new NotificationUserRepository()
            const response = await this.model.create(notificationDTO)
            await notificationUserRepo.createReceiverPayload({
                notificationId: response.id,
                receivers,
            })
            return response.id
        } catch (error) {
            console.error('Error in createNotification', error)
            return []
        }
    }

    async #sendNotification(props) {
        const { notification, channel, priority, socket } = props
        try {
            const notificationUserRepo = new NotificationUserRepository()
            const receiverData = await notificationUserRepo.findAll({
                where: {
                    notificationId: notification,
                },
            })

            const notificationData = await this.model.findOne({
                where: {
                    id: notification,
                },
            })

            if (channel.pushNotification) {
                notificationUserRepo.sendPushNotification({
                    priority,
                    receiverData,
                    notificationData,
                })
            }

            if (channel.socketNotification) {
                notificationUserRepo.sendSocketNotification({
                    priority,
                    receiverData,
                    notificationData,
                    socket,
                })
            }
        } catch (error) {
            console.error('Error in sendNotification', error)
        }
    }

    async sendBloodRequestNotification(props) {
        const { receivers, payload, user, socket } = props
        try {
            const notificationDTO = new NotificationDTO()
            assign(notificationDTO, {
                type: 'info', // info, warning, alert
                title: `${payload.bloodGroup} রক্তের প্রয়োজন`,
                body: `${payload.dataValues.user.name} এর ${payload.bloodGroup} গ্রুপের ${payload.quantity} ব্যাগ রক্ত প্রয়োজন।`,
                userId: user.id,
                data: {
                    type: 'blood_request',
                    requestId: payload.id,
                    url: `dashboard/blood/request/${payload.id}`,
                },
            })

            const notification = await this.#createNotification({
                receivers,
                notificationDTO,
            })

            await this.#sendNotification({
                socket,
                notification,
                priority: 'high',
                channel: {
                    pushNotification: true,
                    socketNotification: true,
                },
            })
        } catch (error) {
            console.error('Error in sendBloodRequestNotification', error)
        }
    }

    async sendAccessInvitationNotification(props) {
        const { receivers, payload, user, socket } = props
        try {
            const notificationDTO = new NotificationDTO()
            assign(notificationDTO, {
                type: 'info', // info, warning, alert
                title: `আপনাকে ${banglaRole(payload.role)} হিসেবে আমন্ত্রণ জানানো হয়েছে`,
                body: `${user.name} আপনাকে "${payload.organizationName}" এর জন্য ${banglaRole(payload.role)} হিসেবে আমন্ত্রণ করেছেন।`,
                userId: user.id,
                data: {
                    type: 'access_invitation',
                    accessId: payload.accessId,
                    url: `dashboard`,
                },
            })

            const notification = await this.#createNotification({
                receivers,
                notificationDTO,
            })

            await this.#sendNotification({
                socket,
                notification,
                priority: 'high',
                channel: {
                    pushNotification: true,
                    socketNotification: true,
                },
            })
        } catch (error) {
            console.error('Error in sendAccessInvitationNotification', error)
        }
    }

    async sendFoundationDonorRegistrationNotification(props) {
        const { receivers, payload, foundation, socket } = props
        try {
            const notificationDTO = new NotificationDTO()
            assign(notificationDTO, {
                type: 'info', // info, warning, alert
                title: `নতুন রক্তদাতা নিবন্ধন`,
                body: `${payload.name} নতুন রক্তদাতা হিসেবে ${foundation.name} -এ নিবন্ধন করেছেন।`,
                userId: foundation.userId,
                data: {
                    type: 'foundation_donor_registration',
                    donorId: payload.id,
                    url: `dashboard`,
                },
            })

            const notification = await this.#createNotification({
                receivers,
                notificationDTO,
            })

            await this.#sendNotification({
                socket,
                notification,
                priority: 'medium',
                channel: {
                    pushNotification: true,
                    socketNotification: true,
                },
            })
        } catch (error) {
            console.error(
                'Error in sendFoundationDonorRegistrationNotification',
                error
            )
        }
    }
}

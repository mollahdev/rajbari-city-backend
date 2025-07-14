const DeviceRepository = require('@/app/repositories/device')
const UserRepository = require('@/app/repositories/user')
const DeviceDTO = require('@/app/dtos/device')
const auth = require('@/app/middleware/auth')
const { isEmpty } = require('lodash')
const { Expo } = require('expo-server-sdk')
const expo = new Expo()

module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '0.0.6',
                    updateFor: ['android'], // ios, android, optional
                    updateType: 'force', // force, optional
                    changeLog: ['বাগ ফিক্স করা হয়েছে'],
                    android: {
                        49: 'https://play.google.com/store/apps/details?id=com.flexlab.rajbaricity',
                        5: 'https://play.google.com/store/apps/details?id=com.flexlab.noakhalicity',
                    },
                    ios: {
                        49: '#',
                        5: '#',
                    },
                },
            })
        },
    })

    routes.post('/device', {
        preHandler: auth,
        schema: {
            body: {
                type: 'object',
                required: ['token', 'platformType'],
                properties: {
                    token: {
                        type: 'string',
                        minLength: 1,
                    },
                    platformType: {
                        type: 'string',
                        enum: ['android', 'ios', 'web'],
                    },
                },
            },
        },
        handler: async (req, res) => {
            const { id } = req.user
            const { token } = req.body

            const deviceRepository = new DeviceRepository()
            const deviceDTO = new DeviceDTO()
            deviceDTO.userId = id
            deviceDTO.token = token
            deviceDTO.platformType = req.body.platformType
            deviceDTO.isActive = true

            const existingDevice = await deviceRepository.findOne({
                where: { userId: id, token },
            })

            if (existingDevice) {
                await deviceRepository.update(deviceDTO, {
                    where: { userId: id, token },
                })
            } else {
                await deviceRepository.create(deviceDTO)
            }

            res.send({ message: 'Device registered successfully' })
        },
    })

    // push notification
    routes.post('/push-notification', {
        preHandler: auth,
        schema: {
            body: {
                type: 'object',
                required: ['title', 'body', 'data'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                    },
                    body: {
                        type: 'string',
                        minLength: 1,
                    },
                    data: {
                        type: 'object',
                        additionalProperties: true,
                    },
                },
            },
        },
        handler: async (req, res) => {
            const { title, body, data } = req.body
            const { district } = req.user

            const deviceRepository = new DeviceRepository()
            const userRepo = new UserRepository()

            // find the users of the district
            const users = await userRepo.findAll({
                where: {
                    district: district,
                    isOnboarded: true,
                },
                attributes: ['id'],
            })

            const userIds = users.map((user) => user.id)
            const devices = await deviceRepository.findAll({
                where: { userId: userIds },
                attributes: ['token', 'platformType'],
            })

            if (isEmpty(devices)) return

            const messages = devices.map((device) => {
                return {
                    to: device.token,
                    sound: 'default',
                    channelId: 'bdCitiesNotification',
                    title: title,
                    body: body,
                    data: data,
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

            res.send({ message: 'Push notifications sent successfully' })
        },
    })
}

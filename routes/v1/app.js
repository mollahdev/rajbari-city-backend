const DeviceRepository = require('@/app/repositories/device')
const DeviceDTO = require('@/app/dtos/device')
const auth = require('@/app/middleware/auth')

module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '0.0.5',
                    updateFor: ['android'], // ios, android, optional
                    updateType: 'force', // force, optional
                    changeLog: [
                        'রক্তের রিকুয়েষ্ট ফিচার যুক্ত হয়েছে',
                        'পোষ্ট হিষ্টরি যুক্ত হয়েছে',
                        'বাগ ফিক্স করা হয়েছে',
                    ],
                    android: {
                        49: 'https://play.google.com/store/apps/details?id=com.flexlab.rajbaricity',
                        5: 'https://play.google.com/store/apps/details?id=com.flexlab.noakhalicity',
                    },
                    ios: {
                        49: '#',
                        // 5: '#',
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
}

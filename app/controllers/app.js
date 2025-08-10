/**
 * Internal dependencies
 */
const Controller = require('./controller')
const DeviceRepository = require('@/app/repositories/device')
const DeviceDTO = require('@/app/dtos/device')
const Geocode = require('@/app/geocode')
const { getFileUrl } = require('@/app/helpers')

class AppController extends Controller {
    static async getAppInfo(req, res) {
        res.send({
            message: 'App information',
            data: {
                assetsUrl: getFileUrl(''),
            },
        })
    }

    static async getReleaseInfo(req, res) {
        res.send({
            message: 'App information',
            data: {
                version: '0.0.7',
                updateFor: ['android'], // ios, android, optional
                updateType: 'force', // force, optional
                changeLog: [
                    'নোটিফিকেশন ফিচার যুক্ত করা হয়েছে',
                    'ডাক্তার ফিচার যুক্ত করা হয়েছে',
                    'ফাউন্ডেশন ডোনার উন্নত করা হয়েছে',
                    'বাগ ফিক্স করা হয়েছে',
                ],
                android: {
                    5: 'https://play.google.com/store/apps/details?id=com.flexlab.noakhalicity',
                    25: 'https://play.google.com/store/apps/details?id=com.flexlab.kushtiacity',
                    49: 'https://play.google.com/store/apps/details?id=com.flexlab.rajbaricity',
                },
                ios: {
                    5: '#',
                    25: '#',
                    49: '#',
                },
            },
        })
    }

    static async registerDevice(req, res) {
        const { id } = req.user
        const { token, platformType } = req.body

        const deviceRepository = new DeviceRepository()
        const deviceDTO = new DeviceDTO()

        const deviceExists = await deviceRepository.findOne({
            where: { userId: id },
        })

        if (deviceExists) {
            await deviceRepository.destroy({
                where: { userId: id },
            })
        }

        deviceDTO.userId = id
        deviceDTO.token = token
        deviceDTO.platformType = platformType
        deviceDTO.isActive = true

        await deviceRepository.create(deviceDTO)
        res.send({ message: 'Device registered successfully' })
    }

    static async location(req, res) {
        try {
            const districts = Geocode.getDistricts()
            const upazilas = districts
                .map((district) => {
                    return Geocode.getUpazilas(
                        (u) => u.district_id == district.id
                    )
                })
                .flat(Infinity)

            const unions = upazilas
                .map((upazila) => {
                    return Geocode.getUnions((u) => u.upazilla_id == upazila.id)
                })
                .flat(Infinity)

            const municipalities = upazilas
                .map((upazila) => {
                    return Geocode.getMunicipalities(
                        (m) => m.upazilla_id == upazila.id
                    )
                })
                .flat(Infinity)

            res.send({
                message: 'fetched successfully',
                data: {
                    districts,
                    upazilas,
                    municipalities,
                    unions,
                },
            })
        } catch (error) {
            Controller.handleError(res, error)
        }
    }
}

module.exports = AppController

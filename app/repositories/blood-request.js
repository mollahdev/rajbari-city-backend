/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
const { Expo } = require('expo-server-sdk')
const expo = new Expo()
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const UserRepository = require('@/app/repositories/user')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const HospitalRepository = require('@/app/repositories/hospital')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const DeviceRepository = require('@/app/repositories/device')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')
const { RECEIVE } = require('@/socket/events')
module.exports = class BloodRequestRepository extends RepositoryBase {
    constructor() {
        super('BloodRequest')
    }

    async #getRequestPayload(props) {
        const { requestId } = props

        const userRepo = new UserRepository()
        const hospitalRepo = new HospitalRepository()
        const diagnosticRepo = new DiagnosticRepository()

        const requestDetails = await this.findOne({
            where: { id: requestId },
        })

        if (!requestDetails) return

        // is expired
        const reqDate = new Date(requestDetails.date)
        const today = new Date()
        const isExpired =
            reqDate.toISOString().slice(0, 10) <
            today.toISOString().slice(0, 10)

        // check if the request date is in the past
        if (isExpired) {
            await this.socketDeleteRequest(props)
            return
        }

        const userDetails = await userRepo.findOne({
            where: { id: requestDetails.userId },
            attributes: ['name', 'profilePictureUrl'],
        })

        userDetails.setDataValue(
            'profilePictureUrl',
            getFileUrl(userDetails.profilePictureUrl || PLACEHOLDER_AVATAR)
        )

        requestDetails.setDataValue('user', userDetails)

        if (requestDetails.locationType === 'hospital') {
            const hospital = await hospitalRepo.findOne({
                where: { id: requestDetails.location },
            })
            requestDetails.setDataValue('locationDetails', {
                name: hospital.name,
                address: hospital.address,
                googleMapUrl: hospital.googleMapUrl,
                upazila: hospital.upazila,
                union: hospital.union,
                district: hospital.district,
                isMunicipality: hospital.isMunicipality,
                municipality: hospital.municipality,
            })
        }

        if (requestDetails.locationType === 'diagnostic') {
            const diagnostic = await diagnosticRepo.findOne({
                where: { id: requestDetails.location },
            })
            requestDetails.setDataValue('locationDetails', {
                name: diagnostic.name,
                address: diagnostic.address,
                googleMapUrl: diagnostic.googleMapUrl,
                upazila: diagnostic.upazila,
                union: diagnostic.union,
                district: diagnostic.district,
                isMunicipality: diagnostic.isMunicipality,
                municipality: diagnostic.municipality,
            })
        }

        return requestDetails
    }

    async socketCreateRequest(props) {
        const { user, socket } = props
        const payload = await this.#getRequestPayload(props)
        if (!payload) return

        socket
            .to(`district.${user.district}`)
            .emit(RECEIVE.NEW_BLOOD_REQUEST, payload)
    }

    async socketUpdateRequest(props) {
        const { user, socket } = props
        const payload = await this.#getRequestPayload(props)
        if (!payload) return

        socket
            .to(`district.${user.district}`)
            .emit(RECEIVE.UPDATE_BLOOD_REQUEST, payload)
    }

    async socketDeleteRequest(props) {
        const { user, requestId, socket } = props
        socket
            .to(`district.${user.district}`)
            .emit(RECEIVE.DELETE_BLOOD_REQUEST, {
                userId: user.id,
                id: requestId,
            })
    }

    async sendPushNotification(props) {
        const { user } = props
        const payload = await this.#getRequestPayload(props)
        if (!payload) return

        const bloodDonorRepo = new BloodDonorRepository()
        const deviceRepo = new DeviceRepository()
        const userRepo = new UserRepository()
        const bloodFoundationRepo = new BloodFoundationRepository()

        const donors = await bloodDonorRepo.findAll({
            where: {
                bloodGroup: payload.bloodGroup,
                isActive: true,
            },
            attributes: ['userId'],
        })

        const foundations = await bloodFoundationRepo.findAll({
            where: {
                district: user.district,
                status: 'active',
            },
            attributes: ['userId'],
        })

        const donorUserIds = donors.map((donor) => donor.userId)
        const foundationUserIds = foundations.map(
            (foundation) => foundation.userId
        )

        const users = await userRepo.findAll({
            where: {
                id: [...donorUserIds, ...foundationUserIds],
                district: user.district,
            },
            attributes: ['id'],
        })

        const userIds = users.map((user) => user.id)

        const devices = await deviceRepo.findAll({
            where: {
                userId: userIds,
            },
            attributes: ['token', 'platformType'],
        })

        if (isEmpty(devices)) return

        const messages = devices.map((device) => {
            return {
                to: device.token,
                sound: 'default',
                priority: 'high',
                channelId: 'bdCitiesNotification',
                title: `${payload.bloodGroup} রক্তের প্রয়োজন`,
                body: `${payload.dataValues.user.name} এর ${payload.bloodGroup} গ্রুপের ${payload.quantity} ব্যাগ রক্ত প্রয়োজন।`,
                data: {
                    type: 'blood_request',
                    requestId: props.requestId,
                    url: `dashboard/blood/request/${props.requestId}`,
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
    }
}

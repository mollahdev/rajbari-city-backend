/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const UserRepository = require('@/app/repositories/user')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const HospitalRepository = require('@/app/repositories/hospital')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const UserRoleRepository = require('@/app/repositories/user-role')

const { getFileUrl, isPastDate } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')
const { RECEIVE } = require('@/socket/events')
const { Op } = require('sequelize')
const { uniq } = require('lodash')

module.exports = class BloodRequestRepository extends RepositoryBase {
    constructor() {
        super('BloodRequest')
    }

    async #getRequestPayload(props) {
        const { requestId } = props

        const userRepo = new UserRepository()
        const hospitalRepo = new HospitalRepository()
        const diagnosticRepo = new DiagnosticRepository()

        const requestDetails = await this.model.findOne({
            where: { id: requestId },
        })

        if (!requestDetails) return
        const isExpired = isPastDate(requestDetails.date)

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

    async getNotificationData(props) {
        try {
            const { user } = props
            const payload = await this.#getRequestPayload(props)
            if (!payload) {
                throw new Error('Request not found or expired')
            }

            const bloodDonorRepo = new BloodDonorRepository()
            const userRepo = new UserRepository()
            const bloodFoundationRepo = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()

            const donors = await bloodDonorRepo.findAll({
                // where: {
                //     bloodGroup: payload.bloodGroup,
                //     isActive: true,
                // },
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
            const foundationIds = foundations.map((foundation) => foundation.id)

            const userRoles = await userRoleRepo.findAll({
                where: {
                    organizationId: {
                        [Op.in]: foundationIds,
                    },
                    status: 'active',
                },
                attributes: ['userId'],
            })

            const foundationUserIds = foundations.map(
                (foundation) => foundation.userId
            )

            const foundationRoleUserIds = userRoles.map((role) => role.userId)

            const targetUserIds = [
                ...donorUserIds,
                ...foundationUserIds,
                ...foundationRoleUserIds,
            ].filter((id) => id !== user.id)

            const users = await userRepo.findAll({
                where: {
                    id: {
                        [Op.in]: uniq(targetUserIds),
                    },
                    district: user.district,
                },
                attributes: ['id'],
            })

            const receivers = users.map((user) => user.id)
            return {
                receivers,
                payload,
            }
        } catch (error) {
            return {
                receivers: [],
                payload: null,
            }
        }
    }
}

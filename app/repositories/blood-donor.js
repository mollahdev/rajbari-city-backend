/**
 * External dependencies
 */
const { isEmpty, isArray } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const UserRepository = require('./user')

const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')
const { RECEIVE } = require('@/socket/events')

module.exports = class BloodDonorRepository extends RepositoryBase {
    constructor() {
        super('BloodDonor')
    }

    async isExists(userId) {
        const result = await this.findOne({
            where: { userId },
        })

        return !isEmpty(result)
    }

    async getDonorByUserId(id) {
        const userRepository = new UserRepository()
        const donorsDetails = await this.findAll({
            where: {
                userId: id,
            },
        })

        const usersDetails = await userRepository.findAll({
            where: { id },
        })

        usersDetails.forEach((user) => {
            const donor = donorsDetails.find(
                (donor) => donor.userId === user.id
            )
            user.setDataValue('bloodGroup', donor.bloodGroup)
            user.setDataValue('description', donor.description)
            user.setDataValue('lastDonatedAt', donor.lastDonatedAt)
            user.setDataValue('createdAt', donor.createdAt)
            user.setDataValue('updatedAt', donor.updatedAt)
            user.setDataValue('password', null)
            user.setDataValue('isActive', donor.isActive)
        })

        return usersDetails
    }

    async socketCreateDonor(user, socket) {
        const donorDetails = await this.getDonorByUserId(user.id)

        if (!isEmpty(donorDetails) && isArray(donorDetails)) {
            const values = donorDetails[0].dataValues
            if (values.isActive) {
                socket
                    .to(`district.${user.district}`)
                    .emit(RECEIVE.NEW_INDIVIDUAL_DONOR, {
                        id: user.id,
                        name: values.name,
                        profilePictureUrl: getFileUrl(
                            values.profilePictureUrl || PLACEHOLDER_AVATAR
                        ),
                        bloodGroup: values.bloodGroup,
                        lastDonatedAt: values.lastDonatedAt,
                        updatedAt: values.updatedAt,
                        description: values.description,
                        upazila: values.upazila,
                        mobile: values.mobile,
                        dialCode: values.dialCode,
                    })
            }
        }
    }

    async socketUpdateDonor(user, socket) {
        const donorDetails = await this.getDonorByUserId(user.id)

        if (!isEmpty(donorDetails) && isArray(donorDetails)) {
            const values = donorDetails[0].dataValues
            if (values.isActive) {
                socket
                    .to(`district.${user.district}`)
                    .emit(RECEIVE.UPDATE_INDIVIDUAL_DONOR, {
                        id: user.id,
                        name: values.name,
                        profilePictureUrl: getFileUrl(
                            values.profilePictureUrl || PLACEHOLDER_AVATAR
                        ),
                        bloodGroup: values.bloodGroup,
                        lastDonatedAt: values.lastDonatedAt,
                        updatedAt: values.updatedAt,
                        description: values.description,
                        upazila: values.upazila,
                        mobile: values.mobile,
                        dialCode: values.dialCode,
                    })
            } else {
                await this.socketDeleteDonor(user, socket)
            }
        }
    }

    async socketDeleteDonor(user, socket) {
        const exists = await this.isExists(user.id)
        if (!exists) return

        socket
            .to(`district.${user.district}`)
            .emit(RECEIVE.DELETE_INDIVIDUAL_DONOR, {
                userId: user.id,
            })
    }
}

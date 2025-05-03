/**
 * External dependencies
 */
const { isEmpty, includes } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const UserRepository = require('./user')

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
            user.setDataValue('lastDonatedAt', donor.lastDonatedAt)
            user.setDataValue('createdAt', donor.createdAt)
            user.setDataValue('updatedAt', donor.updatedAt)
            user.setDataValue('password', null)
        })

        return usersDetails
    }
}

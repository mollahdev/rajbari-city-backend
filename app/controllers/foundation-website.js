/**
 * Internal dependencies
 */
const Controller = require('./controller')
const BloodFoundationDonorRepository = require('@/app/repositories/blood-foundation-donor')
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')

module.exports = class FoundationWebsite {
    static async donorShortList(request, reply) {
        const { foundation } = request
        const donorRepo = new BloodFoundationDonorRepository()

        const donors = await donorRepo.findAndCountAll({
            where: {
                foundationId: foundation.id,
                status: 'active',
            },
            order: [['updatedAt', 'DESC']],
            limit: 11,
            offset: 0,
            attributes: [
                'profilePictureUrl',
                'bloodGroup',
                'name',
                'lastDonatedAt',
            ],
        })

        donors.rows.forEach((item) => {
            item.setDataValue(
                'profilePictureUrl',
                getFileUrl(item.profilePictureUrl || PLACEHOLDER_AVATAR)
            )
        })

        try {
            reply.send({
                message: 'Donor short list fetched successfully',
                data: {
                    donors: donors.rows,
                    total: donors.count,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async donorList(request, reply) {
        try {
            reply.send({
                message: 'Donor list fetched successfully',
                data: [],
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

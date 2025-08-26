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
        try {
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
        const { foundation } = request

        try {
            const searchTerm = request.query.search || ''
            const donorRepo = new BloodFoundationDonorRepository()

            const donorWhereTable = {
                foundationId: foundation.id,
                status: 'active',
            }

            if (request.query.bloodGroup) {
                donorWhereTable.bloodGroup = request.query.bloodGroup
            }

            if (request.query.upazila) {
                donorWhereTable.upazila = request.query.upazila
            }

            if (request.query.gender) {
                donorWhereTable.gender = request.query.gender
            }

            if (searchTerm) {
                donorWhereTable[Op.or] = [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                ]
            }

            const donors = await donorRepo.findAll({
                where: donorWhereTable,
                order: [['updatedAt', 'DESC']],
                attributes: [
                    'profilePictureUrl',
                    'bloodGroup',
                    'name',
                    'lastDonatedAt',
                ],
            })

            donors.forEach((donor) => {
                donor.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(donor.profilePictureUrl || PLACEHOLDER_AVATAR)
                )
            })

            reply.send({
                message: 'Donors fetched successfully',
                data: donors,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

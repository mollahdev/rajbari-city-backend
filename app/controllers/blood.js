/**
 * External dependencies
 */
const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class BloodController {
    static async getAllFoundations(request, reply) {
        const { district } = request.user

        try {
            const foundationRepository = new BloodFoundationRepository()
            const foundations = await foundationRepository.findAllFoundation({
                where: {
                    district,
                    status: 'active',
                },
            })

            foundations.forEach((foundation) => {
                const thumbnailFile = foundation.thumbnailUrl
                    ? `${foundation.userId}/${foundation.thumbnailUrl}`
                    : PLACEHOLDER_IMAGE
                assign(foundation, {
                    thumbnailUrl: getFileUrl(thumbnailFile),
                })
            })

            reply.send({
                message: 'Foundations fetched successfully',
                data: foundations,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

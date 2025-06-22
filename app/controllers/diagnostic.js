/**
 * External dependencies
 */
const { isString } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('./controller')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const DiagnosticServiceRepository = require('@/app/repositories/diagnostic-service')

// const UserRe
const { getFileUrl } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class DiagnosticController {
    static async getAllDiagnostics(request, reply) {
        const { district } = request.user

        try {
            const diagnosticRepo = new DiagnosticRepository()
            const diagnostics = await diagnosticRepo.findAll({
                where: {
                    district,
                    status: 'active',
                },
                order: [
                    ['is_partner', 'DESC'],
                    ['is_verified', 'DESC'],
                    ['updatedAt', 'DESC'],
                ],
            })

            diagnostics.forEach((item) => {
                item.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(item.thumbnailUrl || PLACEHOLDER_IMAGE)
                )

                if (isString(item.mobiles)) {
                    item.setDataValue(
                        'mobiles',
                        JSON.parse(item.mobiles || '[]')
                    )
                }

                if (isString(item.socials)) {
                    item.setDataValue(
                        'socials',
                        JSON.parse(item.socials || '[]')
                    )
                }
            })

            reply.send({
                message: 'data fetched successfully',
                data: diagnostics,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDiagnosticDetails(request, reply) {
        const { id } = request.params
        const { district } = request.user

        try {
            if (!id) {
                throw new Error('diagnostic id is required')
            }

            const diagnosticRepo = new DiagnosticRepository()
            const diagnosticServiceRepo = new DiagnosticServiceRepository()

            const diagnostic = await diagnosticRepo.findOne({
                where: {
                    id,
                    district,
                    status: 'active',
                },
            })

            if (!diagnostic) {
                throw new Error('Diagnostic not found')
            }

            const services =
                await diagnosticServiceRepo.getServicesByDiagnosticId(
                    diagnostic.id
                )

            diagnostic.setDataValue('services', services)
            diagnostic.setDataValue(
                'thumbnailUrl',
                getFileUrl(diagnostic.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            if (isString(diagnostic.mobiles)) {
                diagnostic.setDataValue(
                    'mobiles',
                    JSON.parse(diagnostic.mobiles || '[]')
                )
            }

            if (isString(diagnostic.socials)) {
                diagnostic.setDataValue(
                    'socials',
                    JSON.parse(diagnostic.socials || '[]')
                )
            }

            reply.send({
                message: 'Diagnostic details',
                data: diagnostic,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

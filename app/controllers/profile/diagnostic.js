/**
 * External dependencies
 */
const { assign, isString } = require('lodash')
/**
 * Internal dependencies
 */
const Controller = require('../controller')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const UserRepository = require('@/app/repositories/user')
const DiagnosticServiceRepository = require('@/app/repositories/diagnostic-service')
const DiagnosticDTO = require('@/app/dtos/diagnostic')

// const UserRe
const { getFileUrl, getFileFromPath } = require('@/app/helpers')
const { PLACEHOLDER_IMAGE } = require('@/app/helpers/constants')

module.exports = class DiagnosticController {
    static async createDiagnostic(request, reply) {
        const { district, id } = request.user
        const { isMunicipality, municipality, union } = request.body

        try {
            const diagnosticRepo = new DiagnosticRepository()
            const diagnosticDTO = new DiagnosticDTO()
            const userRepository = new UserRepository()
            const diagnosticServiceRepo = new DiagnosticServiceRepository()

            // check if the user exists
            const user = await userRepository.findOne({
                where: { id },
            })

            if (!user || !user.isVerified || !user.isOnboarded) {
                throw new Error('User not found')
            }

            assign(diagnosticDTO, {
                ...request.body,
                userId: id,
                district,
                thumbnailUrl: getFileFromPath(request.body.thumbnailUrl),
            })

            if (isMunicipality) {
                diagnosticDTO.municipality = municipality
                diagnosticDTO.union = null
            } else {
                diagnosticDTO.union = union
                diagnosticDTO.municipality = null
            }

            const diagnostic = await diagnosticRepo.create(diagnosticDTO)

            diagnostic.setDataValue(
                'thumbnailUrl',
                getFileUrl(diagnostic.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            const services = await diagnosticServiceRepo.createServices(
                diagnostic.id,
                request.body.services
            )

            diagnostic.setDataValue('services', services)
            return {
                message: 'Created successfully',
                data: diagnostic,
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateDiagnosticDetails(request, reply) {
        const { id: diagnosticId } = request.params
        const { id: userId } = request.user

        try {
            if (!diagnosticId) {
                throw new Error('Diagnostic id is required')
            }

            const diagnosticDTO = new DiagnosticDTO()
            const diagnosticRepo = new DiagnosticRepository()
            const diagnosticServiceRepo = new DiagnosticServiceRepository()

            const diagnostic = await diagnosticRepo.findOne({
                where: {
                    id: diagnosticId,
                    userId,
                },
            })

            if (!diagnostic) {
                throw new Error('Diagnostic not found')
            }

            assign(diagnosticDTO, {
                id: diagnosticId,
                ...request.body,
                thumbnailUrl: getFileFromPath(
                    request.body.thumbnailUrl || diagnostic.thumbnailUrl
                ),
            })

            if (request.body.isMunicipality) {
                diagnosticDTO.municipality = request.body.municipality || null
                diagnosticDTO.union = null
            } else {
                diagnosticDTO.union = request.body.union || null
                diagnosticDTO.municipality = null
            }

            await diagnosticRepo.update(diagnosticDTO, {
                where: { id: diagnosticId, userId },
            })

            await diagnosticServiceRepo.updateServices(
                diagnosticId,
                request.body.services
            )

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllDiagnostics(request, reply) {
        const { id: userId } = request.user

        try {
            const diagnosticRepo = new DiagnosticRepository()
            const diagnostics = await diagnosticRepo.findAll({
                where: {
                    userId,
                },
                order: [['createdAt', 'DESC']],
            })

            diagnostics.forEach((item) => {
                item.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(item.thumbnailUrl || PLACEHOLDER_IMAGE)
                )
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
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('diagnostic id is required')
            }

            const diagnosticRepo = new DiagnosticRepository()
            const diagnosticServiceRepo = new DiagnosticServiceRepository()

            const diagnostic = await diagnosticRepo.findOne({
                where: {
                    id,
                    userId,
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

    static async deleteOneDiagnostic(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('Diagnostic id is required')
            }

            const diagnosticRepo = new DiagnosticRepository()
            const diagnostic = await diagnosticRepo.findOne({
                where: { id, userId },
            })

            if (!diagnostic) {
                throw new Error('Diagnostic not found')
            }

            await diagnosticRepo.destroy({
                where: { id, userId },
            })

            reply.send({
                message: 'Deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

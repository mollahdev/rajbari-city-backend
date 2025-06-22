/**
 * External dependencies
 */
const { isArray, uniq, isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const ServiceRespository = require('@/app/repositories/service')
const DiagnosticServiceDTO = require('@/app/dtos/diagnostic-service')

module.exports = class DiagnosticServiceRepository extends RepositoryBase {
    constructor() {
        super('DiagnosticService')
    }

    async createServices(diagnosticId, servicesIds) {
        if (!isArray(servicesIds)) return []

        const services = uniq(servicesIds)
        const serviceRepo = new ServiceRespository()

        const validServices = await serviceRepo.findAll({
            where: {
                id: services,
            },
        })

        if (isEmpty(validServices)) return []

        const bulkDTOs = validServices.map((service) => {
            const serviceDTO = new DiagnosticServiceDTO()
            serviceDTO.serviceId = service.id
            serviceDTO.diagnosticId = diagnosticId
            return serviceDTO
        })

        const createdRecords = await this.model.bulkCreate(bulkDTOs)

        return createdRecords.map((record) => record.serviceId)
    }

    async updateServices(diagnosticId, servicesIds) {
        if (!isArray(servicesIds)) return []

        const services = uniq(servicesIds)
        const serviceRepo = new ServiceRespository()

        const validServices = await serviceRepo.findAll({
            where: {
                id: services,
            },
        })

        if (isEmpty(validServices)) return []

        // Delete existing services for the diagnostic
        await this.model.destroy({
            where: { diagnosticId },
        })

        // Create new services
        return this.createServices(
            diagnosticId,
            validServices.map((s) => s.id)
        )
    }

    async getServicesByDiagnosticId(diagnosticId) {
        if (!diagnosticId) return []

        const services = await this.model.findAll({
            where: { diagnosticId },
        })

        if (isEmpty(services)) return []
        return services.map((service) => service.serviceId)
    }
}

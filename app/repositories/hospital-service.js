/**
 * External dependencies
 */
const { isArray, uniq, isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const ServiceRespository = require('@/app/repositories/service')
const HospitalServiceDTO = require('@/app/dtos/hospital-service')

module.exports = class HospitalServiceRepository extends RepositoryBase {
    constructor() {
        super('HospitalService')
    }

    async createServices(hospitalId, servicesIds) {
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
            const serviceDTO = new HospitalServiceDTO()
            serviceDTO.serviceId = service.id
            serviceDTO.hospitalId = hospitalId
            return serviceDTO
        })

        const createdRecords = await this.model.bulkCreate(bulkDTOs)

        return createdRecords.map((record) => record.serviceId)
    }

    async updateServices(hospitalId, servicesIds) {
        if (!isArray(servicesIds)) return []

        const services = uniq(servicesIds)
        const serviceRepo = new ServiceRespository()

        const validServices = await serviceRepo.findAll({
            where: {
                id: services,
            },
        })

        if (isEmpty(validServices)) return []

        // Delete existing services for the hospital
        await this.model.destroy({
            where: { hospitalId },
        })

        // Create new services
        return this.createServices(
            hospitalId,
            validServices.map((s) => s.id)
        )
    }

    async getServicesByHospitalId(hospitalId) {
        if (!hospitalId) return []

        const services = await this.model.findAll({
            where: { hospitalId },
        })

        if (isEmpty(services)) return []
        return services.map((service) => service.serviceId)
    }
}

const { assign } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const DoctorAvailabilityDTO = require('@/app/dtos/doctor-availability')
const { convertToTimeFormat } = require('@/app/helpers')

module.exports = class DoctorAvailabilityRepository extends RepositoryBase {
    constructor() {
        super('DoctorAvailability')
    }

    async createAvailability(props) {
        const { doctorId, availability } = props

        const isAlreadyExists = await this.model.findOne({
            where: {
                doctorId,
            },
        })

        if (isAlreadyExists) {
            return null
        }

        const days = Object.keys(availability)
        const records = days.map((day) => {
            const availabilityDTO = new DoctorAvailabilityDTO()
            assign(availabilityDTO, {
                doctorId,
                day,
                isAvailable: availability[day].isAvailable,
                startTime: convertToTimeFormat(availability[day].startTime),
                endTime: convertToTimeFormat(availability[day].endTime),
            })
            return availabilityDTO
        })

        return await this.model.bulkCreate(records, {
            returning: true,
        })
    }

    async updateAvailability(props) {
        const { doctorId, availability } = props

        const isAlreadyExists = await this.model.findOne({
            where: {
                doctorId,
            },
        })

        if (!isAlreadyExists) {
            return null
        }

        const days = Object.keys(availability)
        days.forEach((day) => {
            const availabilityDTO = new DoctorAvailabilityDTO()
            assign(availabilityDTO, {
                doctorId,
                day,
                isAvailable: availability[day].isAvailable,
                startTime: convertToTimeFormat(availability[day].startTime),
                endTime: convertToTimeFormat(availability[day].endTime),
            })

            this.model.update(availabilityDTO, {
                where: {
                    doctorId,
                    day,
                },
            })
        })
    }
}

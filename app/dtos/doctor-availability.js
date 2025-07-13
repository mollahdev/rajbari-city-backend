const DTO = require('./dto')

class DoctorAvailabilityDTO extends DTO {
    id
    doctorId
    isAvailable
    day
    startTime
    endTime
}

module.exports = DoctorAvailabilityDTO

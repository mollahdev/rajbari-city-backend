const DTO = require('./dto')

class DoctorAvailabilityDTO extends DTO {
    id
    doctorId
    locationId
    isAvailable
    day
    startTime
    endTime
}

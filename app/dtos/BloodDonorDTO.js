const DTO = require('./DTO')

class BloodDonorDTO extends DTO {
    userId
    bloodGroup
    description
    isActive
    lastDonatedAt
}

module.exports = BloodDonorDTO

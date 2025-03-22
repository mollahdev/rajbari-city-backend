const DTO = require('./dto')

class BloodDonorDTO extends DTO {
    userId
    bloodGroup
    description
    isActive
    lastDonatedAt
}

module.exports = BloodDonorDTO

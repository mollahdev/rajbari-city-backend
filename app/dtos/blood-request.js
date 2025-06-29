const DTO = require('./dto')

class BloodRequestDTO extends DTO {
    id
    userId
    bloodGroup
    quantity
    problem
    dialCode
    mobile
    district
    locationType
    location
    date
    description
}

module.exports = BloodRequestDTO

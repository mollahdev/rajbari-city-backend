const DTO = require('./dto')

class BloodFoundationDonorDTO extends DTO {
    id
    foundationId
    name
    mobile
    dialCode
    bloodGroup
    dob
    gender
    district
    upazila
    union
    isMunicipality
    municipality
    profilePictureUrl
    description
    status
    lastDonatedAt
}

module.exports = BloodFoundationDonorDTO

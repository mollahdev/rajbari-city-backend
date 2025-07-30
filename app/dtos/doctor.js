const DTO = require('./dto')

class DoctorDTO extends DTO {
    id
    userId
    bmdcNumber
    categoryIds
    name
    education
    mobile
    dialCode
    gender
    district
    locationType
    location
    profilePictureUrl
    description
    status
}

module.exports = DoctorDTO

const DTO = require('./DTO')

class UserDTO extends DTO {
    id
    name
    thumbnailUrl
    description
    mobiles
    socials
    district
    upazila
    union
    isMunicipality
    municipality
    userId
    isVerified
    isPartner
    status
}

module.exports = UserDTO

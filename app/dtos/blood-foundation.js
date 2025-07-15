const DTO = require('./dto')

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
    updatedAt
}

module.exports = UserDTO

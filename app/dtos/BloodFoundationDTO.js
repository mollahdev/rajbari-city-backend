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
    userId
    isVerified
    isPartner
    status
}

module.exports = UserDTO

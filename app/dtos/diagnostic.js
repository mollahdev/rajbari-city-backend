const DTO = require('./dto')

class DiagnosticDTO extends DTO {
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
    isAlwaysOpen
    googleMapUrl
    status
    address
}

module.exports = DiagnosticDTO

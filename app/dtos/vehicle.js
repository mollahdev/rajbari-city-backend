const DTO = require('./dto')

class VehicleDTO extends DTO {
    id
    userId
    type
    model
    size
    upazila
    address
    description
    image
}

module.exports = VehicleDTO

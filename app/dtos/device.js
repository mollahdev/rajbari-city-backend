const DTO = require('./dto')

class DeviceDTO extends DTO {
    id
    userId
    token
    platformType
    isActive
}

module.exports = DeviceDTO

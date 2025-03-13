const DTO = require('./DTO')

class UserDTO extends DTO {
    id
    token
    userId
    isValid
    expiresAt
}

module.exports = UserDTO

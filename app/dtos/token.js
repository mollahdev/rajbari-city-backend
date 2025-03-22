const DTO = require('./dto')

class UserDTO extends DTO {
    id
    token
    userId
    isValid
    expiresAt
}

module.exports = UserDTO

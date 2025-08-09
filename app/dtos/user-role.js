const DTO = require('./dto')

class UserRoleDTO extends DTO {
    id
    userId
    createdBy
    organizationId
    organizationType
    role
    status
}

module.exports = UserRoleDTO

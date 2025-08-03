const DTO = require('./dto')

class UserRoleDTO extends DTO {
    id
    userId
    createdBy
    organizationId
    role
    status
}

module.exports = UserRoleDTO

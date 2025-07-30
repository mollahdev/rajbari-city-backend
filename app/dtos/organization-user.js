const DTO = require('./dto')

class OrganizationUserDTO extends DTO {
    id
    userId
    organizationId
    role
    status
}

module.exports = OrganizationUserDTO

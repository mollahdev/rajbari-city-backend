const DTO = require('./dto')

class ServiceDTO extends DTO {
    id
    slug
    name
    description
    categoryId
}

module.exports = ServiceDTO

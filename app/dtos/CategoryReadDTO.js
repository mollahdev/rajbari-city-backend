const DTO = require('./DTO')

class CategoryReadDTO extends DTO {
    page
    perPage
    directoryTypeId
}

module.exports = CategoryReadDTO

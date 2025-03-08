const DTO = require('./DTO')

class ListingDTO extends DTO {
    id
    title
    description
    categoryId
    directoryTypeId
}

module.exports = ListingDTO

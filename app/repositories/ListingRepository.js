/**
 * Internal dependencies
 */
const ListingDTO = require('../dtos/ListingDTO')
const models = require('../../models')

class ListingRepository {
    async get() {
        return await models.Listing.findAll()
    }

    async getById(id) {
        return this.findBy('id', id)
    }

    async findBy(column, value) {
        return await models.Listing.findOne({ where: { [column]: value } })
    }

    /**
     * @param {ListingDTO} dto
     * @returns
     */
    async create(dto) {
        const listing = await models.Listing.create(dto.toJSON())
        return listing.id
    }

    /**
     * @param {ListingDTO} dto
     * @returns
     */
    async update(dto) {
        return await models.Listing.update(dto.toJSON(), {
            where: {
                id: dto.id,
            },
        })
    }

    async delete(id) {
        return await models.Listing.destroy({
            where: { id: id },
        })
    }
}

module.exports = ListingRepository

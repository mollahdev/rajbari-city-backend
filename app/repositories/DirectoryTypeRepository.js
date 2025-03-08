/**
 * Internal dependencies
 */
const DirectoryTypeDTO = require('../dtos/DirectoryTypeDTO')
const models = require('../../models')

class DirectoryTypeRepository {
    async get() {
        return await models.DirectoryType.findAll({
            attributes: ['id', 'name'],
        })
    }

    async getById(id) {
        return this.findBy('id', id)
    }

    async findBy(column, value) {
        return await models.DirectoryType.findOne({
            where: { [column]: value },
        })
    }

    /**
     * @param {DirectoryTypeDTO} dto
     * @returns
     */
    async create(dto) {
        const directoryType = await models.DirectoryType.create(dto.toJSON())
        return directoryType.id
    }

    /**
     * @param {DirectoryTypeDTO} dto
     * @returns
     */
    async update(dto) {
        return await models.DirectoryType.update(dto.toJSON(), {
            where: {
                id: dto.id,
            },
        })
    }

    async delete(id) {
        return await models.DirectoryType.destroy({
            where: { id: id },
        })
    }
}

module.exports = DirectoryTypeRepository

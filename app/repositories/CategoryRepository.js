/**
 * Internal dependencies
 */
const CategoryDTO = require('../dtos/CategoryDTO')
const models = require('../../models')

class CategoryRepository {
    async get() {
        return await models.Category.findAll()
    }

    async getById(id) {
        return this.findBy('id', id)
    }

    async findBy(column, value) {
        return await models.Category.findOne({ where: { [column]: value } })
    }

    /**
     * @param {CategoryDTO} dto
     * @returns
     */
    async create(dto) {
        const category = await models.Category.create(dto.toJSON())
        return category.id
    }

    /**
     * @param {CategoryDTO} dto
     * @returns
     */
    async update(dto) {
        return await models.Category.update(dto.toJSON(), {
            where: {
                id: dto.id,
            },
        })
    }

    async delete(id) {
        return await models.Category.destroy({
            where: { id: id },
        })
    }
}

module.exports = CategoryRepository

/**
 * Internal dependencies
 */
const models = require('@/models')

module.exports = class RepositoryBase {
    constructor(modelName) {
        const model = models[modelName]
        if (!model) {
            throw new Error(`Model ${modelName} not found`)
        }

        this.model = model
    }

    async create(dataDTO) {
        const data = dataDTO.toObject()
        return await this.model.create(data)
    }

    async destroy(query) {
        if (!Reflect.has(query, 'individualHooks')) {
            query.individualHooks = true
        }
        return await this.model.destroy(query)
    }

    async update(dataDTO, query) {
        const data = dataDTO.toObject()
        return await this.model.update(data, query)
    }

    async findOne(query) {
        return await this.model.findOne(query)
    }

    async findAll(query) {
        return await this.model.findAll(query)
    }
}

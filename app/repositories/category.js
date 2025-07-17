const { isEmpty, isArray } = require('lodash')
const { Op } = require('sequelize')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')

module.exports = class CategoryRepository extends RepositoryBase {
    constructor() {
        super('Category')
    }

    async isExists(ids = []) {
        if (isArray(ids)) {
            const categories = await this.findAll({
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                },
            })

            return !isEmpty(categories)
        }

        const category = await this.findOne({
            where: {
                id: ids,
            },
        })

        return !isEmpty(category)
    }
}

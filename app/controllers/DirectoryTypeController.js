/**
 * Internal dependencies
 */
const Controller = require('./Controller')
const DirectoryTypeRepository = require('../repositories/DirectoryTypeRepository')

class DirectoryTypeController {
    static async index(request, reply) {
        const repository = new DirectoryTypeRepository()
        try {
            const types = await repository.get()
            reply.status(201).send({ types })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = DirectoryTypeController

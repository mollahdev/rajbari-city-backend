const path = require('path')

/**
 * Internal dependencies
 */
const Controller = require('./controller')
const UserRepository = require('@/app/repositories/user')
const storage = require('@/app/services/storage')
const { getFileUrl } = require('@/app/helpers')

const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp']
class FileController {
    static async upload(request, reply) {
        const data = await request.file()

        try {
            if (!data) {
                throw new Error('No file uploaded')
            }

            const ext = path
                .extname(data.filename)
                .toLowerCase()
                .replace('.', '')
            if (!allowedExtensions.includes(ext)) {
                throw new Error('Invalid file extension')
            }

            if (data.file.truncated) {
                throw new Error('File size too large')
            }

            const user = new UserRepository()
            const existingUser = await user.findOne({
                where: { id: request.user.id },
            })

            if (!existingUser) {
                throw new Error('User not found')
            }

            const response = await storage.upload(data)

            return {
                message: 'File uploaded successfully',
                data: {
                    url: getFileUrl(response.Key),
                    filename: response.Filename,
                    key: response.Key,
                },
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = FileController

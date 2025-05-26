const TokenRepository = require('@/app/repositories/token')
const { CONNECTION, DISCONNECT } = require('@/socket/events')
/**
 * setup socket connection
 */
module.exports = async (fastify) => {
    fastify.io.on(CONNECTION, async (socket) => {
        try {
            const token =
                socket.handshake.auth.token || socket.handshake.headers.token

            if (!token) {
                throw new Error('Token is required')
            }

            // Check if the token is valid
            const tokenRepository = new TokenRepository()
            const isValid = await tokenRepository.isValid(token)

            if (!isValid) {
                throw new Error('Token is invalid')
            }

            const decoded = fastify.jwt.verify(token)

            if (!decoded) {
                throw new Error('Invalid token')
            }

            socket.join(`user:${decoded.id}`)
        } catch (err) {
            socket.disconnect(true)
            return
        }

        // Handle socket events here
        socket.on(DISCONNECT, () => {
            const token = socket.handshake.query.token
            const decoded = fastify.jwt.verify(token)
            socket.leave(`user.${decoded.id}`)
        })
    })
}

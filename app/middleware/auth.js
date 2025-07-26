/**
 * Internal dependencies
 */
const TokenRepository = require('@/app/repositories/token')
const { convertUnixDateTime } = require('@/app/helpers')

async function auth(request, reply) {
    try {
        // Check for the authorization header (Bearer token)
        const authHeader = request.headers['authorization']

        if (!authHeader) {
            throw new Error('Authorization header is missing')
        }

        // Extract the token (Assuming it's in the format "Bearer <token>")
        const token = authHeader.split(' ')[1]

        if (!token) {
            throw new Error('Token is invalid or missing')
        }

        // Verify the JWT token
        await request.jwtVerify() // This will automatically verify the token using the fastify-jwt plugin

        // Check if the token is valid
        const tokenRepository = new TokenRepository()
        const isValid = await tokenRepository.isValid(token)

        if (!isValid) {
            throw new Error('Token is invalid')
        }

        // decode the token
        const decoded = await request.jwtDecode(token)

        request.user = {
            id: decoded.id,
            expiresAt: convertUnixDateTime(decoded.exp),
            token: token,
            district: decoded.district,
        }
    } catch (error) {
        reply.status(401).send({
            error: error.message,
            action: 'logout',
        })
    }
}

module.exports = auth

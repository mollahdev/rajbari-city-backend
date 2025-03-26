/**
 * External dependencies
 */
const dayjs = require('dayjs')
/**
 * Internal dependencies
 */
const TokenRepository = require('@/app/repositories/token')
const { DATE_TIME_FORMAT } = require('@/app/helpers/constants')

async function auth(request, reply) {
    try {
        // Check for the authorization header (Bearer token)
        const authHeader = request.headers['authorization']

        if (!authHeader) {
            return reply
                .code(401)
                .send({ error: 'Authorization header missing' })
        }

        // Extract the token (Assuming it's in the format "Bearer <token>")
        const token = authHeader.split(' ')[1]

        if (!token) {
            return reply.code(401).send({ error: 'Token missing' })
        }

        // Verify the JWT token
        await request.jwtVerify() // This will automatically verify the token using the fastify-jwt plugin

        // Check if the token is valid
        const tokenRepository = new TokenRepository()
        const isValid = await tokenRepository.isValid(token)

        if (!isValid) {
            return reply.code(401).send({ error: 'Token is invalid' })
        }

        // decode the token
        const decoded = await request.jwtDecode(token)

        request.user = {
            id: decoded.id,
            expiresAt: dayjs.unix(decoded.exp).format(DATE_TIME_FORMAT),
            token: token,
            district: decoded.district,
        }
    } catch (err) {
        return reply.code(401).send({ error: 'Invalid or expired token' })
    }
}

module.exports = auth

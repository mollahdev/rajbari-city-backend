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

        // Optionally, you can add the user info (from the token) to request object
        request.user = request.user || {} // Adding user info from the decoded token
    } catch (err) {
        return reply.code(401).send({ error: 'Invalid or expired token' })
    }
}

module.exports = auth

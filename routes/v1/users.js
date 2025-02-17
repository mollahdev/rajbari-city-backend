module.exports = async (fastify, opts) => {
    fastify.post('register/send-otp', async (request, reply) => {
        return { hello: 'my friend', request: request.body }
    })
}

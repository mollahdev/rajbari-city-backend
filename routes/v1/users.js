module.exports = async (fastify, opts) => {
    fastify.get('register/send-otp', async (request, reply) => {
        return { hello: 'my friend sss', request: request.body }
    })
}

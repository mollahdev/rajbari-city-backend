const validateBody = (schema) => async (req, reply) => {
    try {
        req.body = await schema.validate(req.body, { abortEarly: false })
    } catch (error) {
        return reply.code(400).send({ error: error.errors })
    }
}

module.exports = {
    validateBody,
}

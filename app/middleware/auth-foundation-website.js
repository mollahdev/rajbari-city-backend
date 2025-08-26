const BloodFoundationRepository = require('@/app/repositories/blood-foundation')

async function authFoundationWebsite(request, reply) {
    try {
        const foundationRepo = new BloodFoundationRepository()
        const foundationId = request.headers['foundation']

        if (!foundationId) {
            throw new Error('Foundation ID header is missing')
        }

        const foundation = await foundationRepo.findOne({
            where: {
                id: foundationId,
                status: 'active',
            },
        })

        if (!foundation) {
            throw new Error('Foundation not found')
        }

        request.foundation = foundation.dataValues
    } catch (error) {
        reply.status(401).send({
            error: error.message,
            action: 'logout',
        })
    }
}

module.exports = authFoundationWebsite

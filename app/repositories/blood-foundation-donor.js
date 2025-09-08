/**
 * External dependencies
 */
const { isEmpty } = require('lodash')
/**
 * Internal dependencies
 */
const RepositoryBase = require('./repository-base')
const { RECEIVE } = require('@/socket/events')

module.exports = class BloodFoundationDonorRepository extends RepositoryBase {
    constructor() {
        super('BloodFoundationDonor')
    }

    async isExists(id) {
        const result = await this.findOne({
            where: { id },
        })

        return !isEmpty(result)
    }

    async socketCreateDonor(props) {
        const { payload, receivers, socket } = props
        receivers.forEach((userId) => {
            socket
                .to(`user.${userId}`)
                .emit(RECEIVE.NEW_FOUNDATION_DONOR, payload)
        })
    }

    async socketUpdateDonor(props) {
        const { payload, receivers, socket } = props
        receivers.forEach((userId) => {
            socket
                .to(`user.${userId}`)
                .emit(RECEIVE.UPDATE_FOUNDATION_DONOR, payload)
        })
    }

    async socketDeleteDonor(props) {
        const { payload, receivers, socket } = props
        receivers.forEach((userId) => {
            socket
                .to(`user.${userId}`)
                .emit(RECEIVE.DELETE_FOUNDATION_DONOR, payload)
        })
    }
}

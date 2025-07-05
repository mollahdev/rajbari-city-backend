const { trim, isString } = require('lodash')

class DTO {
    toObject() {
        const jsonObj = {}
        Object.getOwnPropertyNames(this).forEach((prop) => {
            const value = this[prop] // Access private field
            if (value === undefined) return

            if (isString(value)) {
                jsonObj[prop] = trim(value)
                return
            }

            jsonObj[prop] = value
        })

        return jsonObj
    }
}

module.exports = DTO

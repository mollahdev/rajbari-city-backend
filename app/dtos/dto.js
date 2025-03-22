class DTO {
    toObject() {
        const jsonObj = {}
        Object.getOwnPropertyNames(this).forEach((prop) => {
            const value = this[prop] // Access private field
            if (value !== undefined) {
                jsonObj[prop] = value
            }
        })

        return jsonObj
    }
}

module.exports = DTO

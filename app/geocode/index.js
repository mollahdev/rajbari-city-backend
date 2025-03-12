const districts = require('./districts.json')
const upazilas = require('./upazilas.json')
const unions = require('./unions.json')

module.exports = class Geocode {
    static get unions() {
        return unions
    }
    static get upazilas() {
        return upazilas
    }
    static get districts() {
        return districts
    }

    static getUnions(filterCallback) {
        if ('function' === typeof filterCallback) {
            return unions.filter(filterCallback)
        }

        return unions
    }

    static getUpazilas(filterCallback) {
        if ('function' === typeof filterCallback) {
            return upazilas.filter(filterCallback)
        }

        return upazilas
    }

    static getDistricts(filterCallback) {
        if ('function' === typeof filterCallback) {
            return districts.filter(filterCallback)
        }

        return districts
    }

    static isValid(query) {
        const { district, upazila, union } = query || {}

        if (!district || !upazila || !union) {
            return false
        }

        const districtObj = districts.find((d) => d.id === district)
        if (!districtObj) {
            return false
        }

        const upazilaObj = upazilas.find((u) => u.id === upazila)
        if (!upazilaObj) {
            return false
        }

        const unionObj = unions.find((u) => u.id === union)
        if (!unionObj) {
            return false
        }

        return (
            upazilaObj.district_id === district &&
            unionObj.upazilla_id === upazila
        )
    }
}

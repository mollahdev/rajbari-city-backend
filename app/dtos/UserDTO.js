class UserDTO {
    // Private fields
    _name = null
    _mobile_number = null
    _password
    _date_of_birth = null
    _gender = null
    _thana = null

    // Getters and Setters
    get name() {
        return this._name
    }

    set name(value) {
        this._name = value
    }

    get mobile_number() {
        return this._mobile_number
    }

    set mobile_number(value) {
        this._mobile_number = value
    }

    get password() {
        return this._password
    }

    set password(value) {
        this._password = value
    }

    get date_of_birth() {
        return this._date_of_birth
    }

    set date_of_birth(value) {
        this._date_of_birth = value
    }

    get gender() {
        return this._gender
    }

    set gender(value) {
        this._gender = value
    }

    get thana() {
        return this._thana
    }

    set thana(value) {
        this._thana = value
    }
}

module.exports = UserDTO

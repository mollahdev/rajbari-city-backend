const DTO = require('./DTO')

class UserDTO extends DTO {
    id
    name
    mobileNumber
    password
    dateOfBirth
    gender
    thana
    otp
    otpCreatedAt
    isVerified
    verifiedAt
}

module.exports = UserDTO

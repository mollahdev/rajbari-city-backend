const DTO = require('./DTO')

class UserDTO extends DTO {
    id
    name
    mobile
    dialCode
    password
    dob
    gender
    district
    upazila
    union
    otp
    otpCreatedAt
    profilePictureUrl
    isOnboarded
    isVerified
}

module.exports = UserDTO

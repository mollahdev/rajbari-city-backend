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
    thana
    upazila
    union
    otp
    otpCreatedAt
    profilePictureId
    isVerified
    verifiedAt
}

module.exports = UserDTO

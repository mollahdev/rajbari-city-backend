const Geocode = require('@/app/geocode')

module.exports = class SMS {
    static registrationTemplate(district, otp) {
        return `Rajbari City App registration OTP is ${otp}`
    }

    static forgotPasswordTemplate(district, otp) {
        return `Rajbari City App reset password OTP is ${otp}`
    }

    static async send(mobile, message) {
        const api_key = process.env.SMS_API_KEY
        const senderid = process.env.SMS_SENDER_ID
        const url = `http://bulksmsbd.net/api/smsapi?api_key=${api_key}&type=text&number=${mobile}&senderid=${senderid}&message=${message}`

        const response = await fetch(url)
        const { response_code } = await response.json()

        if (response_code != 202) {
            throw new Error('Failed to send SMS')
        }
    }
}

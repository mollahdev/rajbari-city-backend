const Geocode = require('../geocode')

module.exports = class SMS {
    static registrationTemplate(district, otp) {
        const data = Geocode.getDistricts((d) => d.id == district)
        return `Welcome to ${data.name} City App! Your registration OTP is: ${otp}. Please use this code to complete your signup.`
    }

    static forgotPasswordTemplate(district, otp) {
        const data = Geocode.getDistricts((d) => d.id == district)
        return `Reset your password on ${data.name} City App. Your OTP is: ${otp}. Enter this code to proceed with password reset.`
    }

    static async send(mobile, message) {
        const api_key = process.env.SMS_API_KEY
        const senderid = process.env.SMS_SENDER_ID
        const url = `http://bulksmsbd.net/api/smsapi?api_key=${api_key}&type=text&number=${mobile}&senderid=${senderid}&message=${message}`
        try {
            const response = await fetch(url)
            const data = await response.json()
            return data
        } catch (err) {
            return err
        }
    }
}

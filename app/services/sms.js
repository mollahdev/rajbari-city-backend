const Geocode = require('@/app/geocode')

module.exports = class SMS {
    static registrationTemplate(district, otp) {
        const data = Geocode.getDistricts((d) => d.id == district)
        const districtName = (data[0] && data[0].name) || ''
        return `${districtName} City App registration OTP is ${otp}`
    }

    static forgotPasswordTemplate(district, otp) {
        const data = Geocode.getDistricts((d) => d.id == district)
        const districtName = (data[0] && data[0].name) || ''
        return `${districtName} City App reset password OTP is ${otp}`
    }

    static async send(mobile, message) {
        const api_key = process.env.SMS_API_KEY
        const senderid = process.env.SMS_SENDER_ID
        const url = `http://bulksmsbd.net/api/smsapi?api_key=${api_key}&type=text&number=${mobile}&senderid=${senderid}&message=${message}`
        try {
            // const response = await fetch(url)
            // return await response.json()
            return url
        } catch (err) {
            return err
        }
    }
}

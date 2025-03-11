const districts = require('./../geocode/districts.json')

module.exports = class SMS {
    static registrationTemplate(district, otp) {
        const data = districts.find((d) => d.id == district)
        return `${data.name} City App registration OTP is ${otp}`
    }

    static async send(mobile, message) {
        const api_key = process.env.SMS_API_KEY
        const senderid = process.env.SMS_SENDER_ID
        const url = `http://bulksmsbd.net/api/smsapi?api_key=${api_key}&type=text&number=${mobile}&senderid=${senderid}&message=${message}`
        try {
            // const response = await fetch(url)
            // const data = await response.json()
            // return data
            return url
        } catch (err) {
            console.log(err)
            return err
        }
    }
}

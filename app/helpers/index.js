const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

const sendSMS = async (number, message) => {
    const api_key = process.env.SMS_API_KEY
    const senderid = process.env.SMS_SENDER_ID
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${api_key}&type=text&number=${number}&senderid=${senderid}&message=${message}`
    try {
        // const response = await fetch(url)
        // const data = await response.json()
        return url
    } catch (err) {
        console.log(err)
        return err
    }
}

function now() {
    dayjs.extend(utc)
    return dayjs().utc().format('YYYY-MM-DD HH:mm:ss')
}

module.exports = {
    sendSMS,
    now,
}

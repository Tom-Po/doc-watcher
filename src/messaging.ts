import dotenv from 'dotenv'
import { Twilio } from 'twilio'

dotenv.config()

async function sendSMS(message: string) {
    const smsClient = new Twilio(process.env.TWILIO_SSID, process.env.TWILIO_API_KEY)
    return smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.MY_PHONE_NUMBER as string
    })
        .then((message) => console.log(message))
        .catch((error) => console.log(error))
}

export {
    sendSMS
}

import axios from 'axios';
import dotenv from 'dotenv';
import { Twilio } from 'twilio';

dotenv.config()
async function shortenUrl(url: string) {
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };
    const response = await axios.post(`https://api.tinyurl.com/create?api_token=${process.env.TINY_URL_API_KEY}&url=${url}`, {
        method: "POST",
        headers,
    })
    if (!response.data.data) {
        throw new Error('Error trying to shorten url')
    }
    return response.data.data.tiny_url
}

async function sendSMS(message: string) {
    const smsClient = new Twilio(process.env.TWILIO_SSID, process.env.TWILIO_API_KEY)
    return smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.CLIENT_PHONE_NUMBER as string
    })
        .then((message) => console.log(message))
        .catch((error) => console.log(error))
}

export {
    sendSMS,
    shortenUrl
};


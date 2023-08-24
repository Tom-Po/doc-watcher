import axios from 'axios';
import { shortenUrl } from './messaging';
import { filterSlotsInRange, getAvailableSlots, Logger } from './utils';
const logger = Logger()

const baseUrl = "https://www.doctolib.fr/availabilities.json?"
// https://www.doctolib.fr/availabilities.json?visit_motive_ids=2119557&agenda_ids=337471&practice_ids=133609&telehealth=false&limit=5&start_date=2024-01-05
const brunoUrl = "https://www.doctolib.fr/rhumatologue/cergy-le-haut/bruno-roche/booking/availabilities?isNewPatient=true&isNewPatientBlocked=false&telehealth=false&placeId=practice-133609&specialityId=24&motiveIds%5B%5D=2119557"
const visitMotiveIds = 2119557
const agendaIds = 337471
const practiceIds = 133609
const limit = 10

// One hour
const RETRY_DELAY = 3600000
// Default today
let startDate = new Date("2023-08-20")
// Default one week
const appointmentDate = new Date("2024-01-5")
appointmentDate.setHours(11, 20)

const builder = (baseUrl: string, visitMotiveIds: string | number, agendaIds: string | number, practiceIds: string | number, limit: string | number, startDate: string | number) => (
    `${baseUrl}visit_motive_ids=${visitMotiveIds}&agenda_ids=${agendaIds}&practice_ids=${practiceIds}&telehealth=false&limit=${limit}&start_date=${startDate}`
)

async function getData(url: string) {
    return await axios.get(url)
}

const sleepSearch = (timeout: number = RETRY_DELAY) => setTimeout(() => {
    startDate = new Date()
    search()
}, timeout)

const resetSearch = () => {
    logger.reset()
    sleepSearch()
}

logger.init(startDate, appointmentDate)

let pass = 0

async function search() {
    let newSlots: Date[] = []
    pass++
    console.log(`This is pass n°: ${pass}`);
    const data = await getData(
        builder(
            baseUrl,
            visitMotiveIds,
            agendaIds,
            practiceIds,
            limit,
            startDate.toISOString().split('T')[0]
        ))

    if (data.data.reason === "not_opened_availability") {
        logger.notOpenAvailability()
        return
    }
    // If we detect next_slot, it means all slots are empty
    // We set start date to next_slot and reset
    if (data.data.next_slot) {
        startDate = new Date(data.data.next_slot)
        if (startDate.getTime() > appointmentDate.getTime()) {
            logger.tooLate()
            resetSearch()
        }
        logger.nextSlot(startDate)
        search()
        return
    } else {
        newSlots = getAvailableSlots(data.data)
        const emptySlots = filterSlotsInRange(newSlots, startDate, appointmentDate)

        if (emptySlots.length > 0) {
            const fistEmptySlot = emptySlots[0]
            logger.availableBooking(emptySlots)
            console.log("Sending SMS... content:");
            const message = emptySlots.map(s => (`RDV Dispo le ${s.toISOString().split('T')[0]} à ${("0" + s.getHours()).slice(-2)}:${("0" + s.getMinutes()).slice(-2)}\n`))
            // sendSMS('\nDr Bruno Roche \n' + message.join(''))
            const shortUrl = await shortenUrl(brunoUrl)
            console.log(shortUrl + '\nDr Bruno Roche \n' + message.join(''))
            return
        }
        resetSearch()
    }
}
search()


// 'https://www.doctolib.fr/osteopathe/paris/charlotte-redon-paris/booking/availabilities?telehealth=false&placeId=practice-206971&specialityId=10&motiveIds%5B%5D=3140257'
// https://www.doctolib.fr/availabilities.json?visit_motive_ids=3140257&agenda_ids=521038&practice_ids=206971&telehealth=false&limit=5&start_date=2023-09-23
// `${baseUrl}isNewPatient=false&agenda_ids=${agendaIds}&isNewPatientBlocked=false&telehealth=false&practice_ids=${practiceIds}&specialityId=21&motiveCategoryIds[]=19512&visit_motive_ids[]=698035&start_date=${startDate}`
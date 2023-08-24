import axios from 'axios';
import { DoctolibAvailabilitiesFile } from './type';
import { Logger } from './utils';

'https://www.doctolib.fr/osteopathe/paris/charlotte-redon-paris/booking/availabilities?telehealth=false&placeId=practice-206971&specialityId=10&motiveIds%5B%5D=3140257'

const baseUrl = "https://www.doctolib.fr/availabilities.json?"

const visitMotiveIds = 3140257
const agendaIds = 521038
const practiceIds = 206971
const limit = 10

// One hour
const RETRY_DELAY = 3600000
// Default today
let startDate = new Date()
// Default one week
const appointmentDate = new Date("2023-09-19")

const logger = Logger()

// https://www.doctolib.fr/availabilities.json?visit_motive_ids=3140257&agenda_ids=521038&practice_ids=206971&telehealth=false&limit=5&start_date=2023-09-23
// `${baseUrl}isNewPatient=false&agenda_ids=${agendaIds}&isNewPatientBlocked=false&telehealth=false&practice_ids=${practiceIds}&specialityId=21&motiveCategoryIds[]=19512&visit_motive_ids[]=698035&start_date=${startDate}`

const builder = (baseUrl: string, visitMotiveIds: string | number, agendaIds: string | number, practiceIds: string | number, limit: string | number, startDate: string | number) => (
    `${baseUrl}visit_motive_ids=${visitMotiveIds}&agenda_ids=${agendaIds}&practice_ids=${practiceIds}&telehealth=false&limit=${limit}&start_date=${startDate}`
)
export async function getData(url: string) {
    return await axios.get(url)
}

const sortSlots = (slots: Date[]) => (slots.filter((s) => (
    s.getTime() < appointmentDate.getTime() && s.getTime() >= startDate.getTime()
)))

function getAvailableSlots(data: DoctolibAvailabilitiesFile) {
    const allAvailableSlots: Date[] = []
    data.availabilities.forEach((a) => {
        allAvailableSlots.push(...a.slots.map((s) => new Date(s)))
    })
    return allAvailableSlots
}

let pass = 0
let lastPass = 0
let hasBeenStarted = false

async function initSearch(slots: Date[]) {
    pass++
    console.log(`This is pass n°: ${pass}`);


    const sleepSearch = (timeout: number = RETRY_DELAY) => setTimeout(() => {
        startDate = new Date()
        initSearch([])
    }, timeout)

    const resetSearch = () => {
        logger.reset()
        sleepSearch()
    }

    // If the new start date is set further than the appointment
    // Sleep timeout and retry from today
    if (startDate.getTime() > appointmentDate.getTime()) {
        logger.tooLate()
        resetSearch()
        return false
    }

    if (!hasBeenStarted) {
        logger.init(startDate, appointmentDate)
        hasBeenStarted = true
    } else {
        logger.nextSlot(startDate)
    }

    let newSlots: Date[] = [...slots]

    const buildUrl = builder(
        baseUrl,
        visitMotiveIds,
        agendaIds,
        practiceIds,
        limit,
        startDate.toISOString().split('T')[0]
    )

    const data = await getData(buildUrl)

    // If we detect next_slot, it means all slots are empty
    // We set start date to next_slot and reset
    if (data.data.next_slot) {
        startDate = new Date(data.data.next_slot)
        initSearch(newSlots)
    } else {
        newSlots = getAvailableSlots(data.data)
        const emptySlots = sortSlots(newSlots)

        if (emptySlots.length > 0) {
            const fistEmptySlot = emptySlots[0]
            logger.availableBooking(emptySlots)
            console.log("Sending SMS...");
            console.log(`RDV Dispo le ${fistEmptySlot.toISOString().split('T')[0]} à ${("0" + fistEmptySlot.getHours()).slice(-2)}:${("0" + fistEmptySlot.getMinutes()).slice(-2)}`)
            // sendSMS(`RDV Dispo le ${fistEmptySlot.toISOString().split('T')[0]} à ${("0" + fistEmptySlot.getHours()).slice(-2)}:${("0" + fistEmptySlot.getMinutes()).slice(-2)}`)
            return false
        }
        resetSearch()
    }
}
initSearch([])

import axios from 'axios'
import { DoctolibAvailabilitiesFile } from './type'

const baseUrl = "https://www.doctolib.fr/availabilities.json?"
const visitMotiveIds = 3140257
const agendaIds = 114622
const practiceIds = 42508
const limit = 10
const RETRY_DELAY = 60000

// Default today
let startDate = new Date("2023-12-13")
// Default one week
const appointmentDate = new Date("2024-01-01")

const builder = (baseUrl: string, visitMotiveIds: string | number, agendaIds: string | number, practiceIds: string | number, limit: string | number, startDate: string | number) => (
    `${baseUrl}isNewPatient=false&agenda_ids=${agendaIds}&isNewPatientBlocked=false&telehealth=false&practice_ids=${practiceIds}&specialityId=21&motiveCategoryIds[]=19512&visit_motive_ids[]=698035&start_date=${startDate}`
)
// `${baseUrl}visit_motive_ids=${visitMotiveIds}&agenda_ids=${agendaIds}&practice_ids=${practiceIds}&telehealth=false&limit=${limit}&start_date=${startDate}`

async function getData(url: string) {
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
let hasBeenReset = false
let hasBeenStarted = false

async function initSearch(slots: Date[]) {
    pass++
    console.log(`This is pass n°: ${pass}`);

    if (lastPass > 0) {
        console.log(`Last pass was ${lastPass} ago`);
    }

    const loggerInfos = (start: Date, appointment: Date) => {
        console.log('Init Search');
        console.log(' ');
        console.log('Current startDate (default today)');
        console.log(start)
        console.log('Appointment Date');
        console.log(appointment)
    }

    if (!hasBeenStarted) {
        loggerInfos(startDate, appointmentDate)
        hasBeenStarted = true
    } else {
        console.log('Continuing search with next_slot:');
        console.log(startDate)
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

    // If the new start date is set further than the appointment
    // Sleep timeout and retry from today
    const sleepSearch = (timeout: number) => setTimeout(() => {
        startDate = new Date()
        initSearch([])
    }, timeout)

    const resetSearch = (delay = RETRY_DELAY) => {
        console.log("Resetting search ...");
        hasBeenReset = true
        sleepSearch(delay)
    }

    if (startDate.getTime() > appointmentDate.getTime()) {
        console.log("Next_step is later than current appointment");
        resetSearch()
        return false
    }

    // If we detect next_slot, it means all slots are empty
    // We set start date to next_slot and reset
    if (data.data.next_slot) {
        startDate = new Date(data.data.next_slot)
        initSearch(newSlots)
    } else {
        newSlots = getAvailableSlots(data.data)
        const emptySlots = sortSlots(newSlots)

        if (emptySlots.length > 0) {
            console.log('Found available booking');
            emptySlots.forEach(s => {
                console.log(`RDV Dispo le ${s.toISOString().split('T')[0]} à ${("0" + s.getHours()).slice(-2)}:${("0" + s.getMinutes()).slice(-2)}`);
            })
            console.log("Sending SMS...");
            return false
        }
        resetSearch()
    }


}
initSearch([])

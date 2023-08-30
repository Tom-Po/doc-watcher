// // Compare arrays 
// export function comparArr(arr1: any[], arr2: any[]) {
//     return JSON.stringify(arr1) === JSON.stringify(arr2)

import { DoctolibAvailabilitiesFile } from "./type";

// }
const Logger = () => {
    const init = (start: Date, appointment: Date) => {
        console.log(' ');
        console.log('Init Search');
        console.log('Current startDate (default today)');
        console.log(start)
        console.log('Appointment Date');
        console.log(appointment)
        console.log('')
    }

    const reset = () => {
        console.log("Resetting search ...");
    }

    const nextSlot = (slot: Date) => {
        console.log('Continuing search with next_slot:');
        console.log(slot)
    }

    const availableBooking = (slots: Date[]) => {
        console.log('Found available booking');
        slots.forEach(s => {
            console.log(`RDV Dispo le ${s.toISOString().split('T')[0]} à ${("0" + s.getHours()).slice(-2)}:${("0" + s.getMinutes()).slice(-2)}`);
        })
    }

    const tooLate = () => {
        console.log("Next_step is later than current appointment");
    }

    const notOpenAvailability = () => {
        console.log("This period cannot be booked for now");
    }

    return {
        init,
        reset,
        nextSlot,
        availableBooking,
        tooLate,
        notOpenAvailability
    }
}
const filterSlotsInRange = (slots: Date[], start: Date, appointment: Date) => (slots.filter((s) => (
    s.getTime() < appointment.getTime() && s.getTime() >= start.getTime()
)))

const getAvailableSlots = (data: DoctolibAvailabilitiesFile) => {
    const allAvailableSlots: Date[] = []
    data.availabilities.forEach((a) => {
        allAvailableSlots.push(...a.slots.map((s) => new Date(s)))
    })
    return allAvailableSlots
}

function msToTime(duration: number) {
    let minutes: number | string = Math.floor((duration / (1000 * 60)))


    return minutes;
}

export {
    Logger,
    getAvailableSlots,
    filterSlotsInRange,
    msToTime
};

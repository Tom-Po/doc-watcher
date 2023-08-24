// // Compare arrays 
// export function comparArr(arr1: any[], arr2: any[]) {
//     return JSON.stringify(arr1) === JSON.stringify(arr2)
// }
const Logger = () => {
    const init = (start: Date, appointment: Date) => {
        console.log(' ');
        console.log('Init Search');
        console.log('Current startDate (default today)');
        console.log(start)
        console.log('Appointment Date');
        console.log(appointment)
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
    return {
        init,
        reset,
        nextSlot,
        availableBooking,
        tooLate
    }
}

export {
    Logger
};

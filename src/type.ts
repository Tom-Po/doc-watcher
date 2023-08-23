
type Availability = {
    date: string,
    slots: string[],
    substitution: boolean,
    appointment_request_slots: string[]
    next_slot: string[]
}

type DoctolibAvailabilitiesFile = {
    availabilities: Availability[]
}

export {
    Availability,
    DoctolibAvailabilitiesFile
}

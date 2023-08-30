import axios from 'axios';
import cors from 'cors';
import express, { Request } from 'express';
import search from './search';

const visitMotiveIds = 2119557
const agendaIds = 337471
const practiceIds = 133609
const limit = 10
// Default today
let startDate = new Date("2023-09-01")
// Default one week
const appointmentDate = new Date("2024-01-5")

const app = express()
const port = 4201

app.use(cors({
    origin: '*'
}));

app.get('/search/:docinfos', async (req, res) => {
    const docInfos = req.params.docinfos
    const results = await axios.get(`https://www.doctolib.fr/api/searchbar/autocomplete.json?search=${docInfos}`)
    res.send(results.data)
})

app.get('/details', async (req: Request<{ doctor_id: string }>, res) => {
    const doctorId = req.query.doctor_id
    const result = await axios.get(`https://www.doctolib.fr/online_booking/draft/new.json?id=${doctorId}`)
    res.send(result.data)
})

// https://www.doctolib.fr/availabilities.json?visit_motive_ids=2119557&agenda_ids=337471&practice_ids=133609&telehealth=false&limit=5&start_date=2024-01-05
app.get('/availabilities', async (req: Request<{ visit_motive_ids: string, agenda_ids: string, practice_ids: string, start_date: string }>, res) => {

    const visitMotiveIds = (req.query.visit_motive_ids as unknown as number) || 2119557
    const agendaIds = (req.query.agenda_ids as unknown as number) || 337471
    const practiceIds = (req.query.practice_ids as unknown as number) || 133609
    const startDate = (req.query.start_date as unknown as Date) || new Date().toISOString().split('T')[0]

    if (true) {
        console.log("New query");
        console.log(visitMotiveIds, agendaIds, practiceIds, startDate)
        search({
            startDate,
            appointmentDate,
            visitMotiveIds,
            agendaIds,
            limit,
            practiceIds
        })
    } else {
        const result = await axios.get(
            `https://www.doctolib.fr/availabilities.json?visit_motive_ids=${visitMotiveIds}&agenda_ids=${agendaIds}&practice_ids[]=${practiceIds}&telehealth=false&limit=5&start_date=${startDate}`
        )
        console.log(`https://www.doctolib.fr/availabilities.json?visit_motive_ids=${visitMotiveIds}&agenda_ids=${agendaIds}&practice_ids[]=${practiceIds}&telehealth=false&limit=5&start_date=${startDate}`);

        res.send(result.data)
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
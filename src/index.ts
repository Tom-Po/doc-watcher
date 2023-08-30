import axios from 'axios';
import cors from 'cors';
import express from 'express';
import search from './search';

const visitMotiveIds = 2119557
const agendaIds = 337471
const practiceIds = 133609
const limit = 10
// Default today
let startDate = new Date("2023-09-01")
// Default one week
const appointmentDate = new Date("2024-01-5")

search({
    startDate,
    appointmentDate,
    visitMotiveIds,
    agendaIds,
    limit,
    practiceIds
})

const app = express()
const port = 4200
app.use(cors({
    origin: '*'
}));

app.get('/search/:docinfos', async (req, res) => {
    const docInfos = req.params.docinfos
    const results = await axios.get(`https://www.doctolib.fr/api/searchbar/autocomplete.json?search=${docInfos}`)
    res.send(results.data.profiles)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
import axios from "axios"
import { filterSlotsInRange, getAvailableSlots, Logger } from "./utils"

const logger = Logger()
const baseUrl = "https://www.doctolib.fr/availabilities.json?"
// One hour
const RETRY_DELAY = 3600000 / 2

let pass = 0

const builder = (visitMotiveIds: string | number, agendaIds: string | number, practiceIds: string | number, limit: string | number, startDate: string | number) => (
  `${baseUrl}visit_motive_ids=${visitMotiveIds}&isNewPatient=true&agenda_ids=${agendaIds}&practice_ids=${practiceIds}&telehealth=false&limit=${limit}&start_date=${startDate}`
)

const resetSearch = (params: SearchParams, timeout = RETRY_DELAY) => {
  console.log(`Retrying in ${Math.floor((timeout / (1000 * 60)))} minutes`)
  setTimeout(() => {
    search({ ...params, startDate: new Date() })
  }, timeout)
}


async function fetchData(requestParams: string) {
  const response = await axios.get(requestParams);
  return response.data;
}

function handleNextSlot(nextSlot: string, params: SearchParams) {
  const nextSlotDate = new Date(nextSlot);
  if (nextSlotDate.getTime() > params.appointmentDate.getTime()) {
    logger.tooLate();
    resetSearch(params);
  } else {
    logger.nextSlot(nextSlotDate);
    search({ ...params, startDate: nextSlotDate });
  }
}

async function handleAvailableBooking(slot: Date) {
  logger.availableBooking([slot]);
  const message = createMessage(slot);
  const shortUrl = "http://doctolib.fr" // await shortenUrl(brunoUrl);

  // await Promise.all([
  //     sendSMS(shortUrl + '\nDr Bruno Roche \n' + message, process.env.CLIENT_PHONE_NUMBER),
  //     sendSMS(shortUrl + '\nDr Bruno Roche \n' + message, process.env.MY_PHONE_NUMBER)
  // ]);

  console.log(shortUrl + '\nDr Bruno Roche \n' + message, process.env.MY_PHONE_NUMBER);
}

function createMessage(slot: Date): string {
  return `RDV Dispo le ${formatDate(slot)} à ${formatTime(slot)}\n`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTime(date: Date): string {
  return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
}

function handleSearchError(error: any) {
  console.error("An error occurred:", error);
  // Handle the error or rethrow it as needed
}
type SearchParams = { startDate: Date, appointmentDate: Date, visitMotiveIds: number, agendaIds: number, limit: number, practiceIds: number }
async function search(params: SearchParams) {
  const { startDate, appointmentDate, visitMotiveIds, practiceIds, agendaIds, limit } = params;
  try {
    pass++;
    console.log(`This is pass n°: ${pass}`);

    const data = await fetchData(builder(
      visitMotiveIds,
      agendaIds,
      practiceIds,
      limit,
      new Date(startDate).toISOString().split('T')[0]
    ));

    if (data.reason === "not_opened_availability") {
      logger.notOpenAvailability();
      return;
    }

    if (data.next_slot) {
      handleNextSlot(data.next_slot, params);
    } else {
      const newSlots = getAvailableSlots(data);
      const emptySlots = filterSlotsInRange(newSlots, startDate, appointmentDate);

      if (emptySlots.length > 0) {
        const firstEmptySlot = emptySlots[0];
        handleAvailableBooking(firstEmptySlot);
      } else {
        resetSearch({
          ...params,
          startDate: new Date()
        });
      }
    }
  } catch (error) {
    handleSearchError(error);
  }
}

export default search;
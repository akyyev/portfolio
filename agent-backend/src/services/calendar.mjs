import { config } from '../config.mjs';

const CALENDAR_ID = process.env.CALENDAR_ID || 'ba.akyyev@gmail.com';
const AVAILABLE_SLOT_SUMMARY = 'available';
const BOTFOLIO_MARKER = 'botfolio';

let calendarClient;

async function getCalendarClient() {
  if (calendarClient) return calendarClient;
  if (!config.googleServiceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is required for calendar tools.');
  }

  const { google } = await import('googleapis');
  const serviceAccount = JSON.parse(config.googleServiceAccountKey);
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  calendarClient = google.calendar({ version: 'v3', auth });
  return calendarClient;
}

function toIsoDate(value, fieldName) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date-time.`);
  }
  return date.toISOString();
}

function assertStartBeforeEnd(start, end) {
  if (new Date(start).getTime() >= new Date(end).getTime()) {
    throw new Error('start must be before end.');
  }
}

function eventStart(event) {
  return event.start?.dateTime || event.start?.date;
}

function eventEnd(event) {
  return event.end?.dateTime || event.end?.date;
}

function isAvailableSlot(event) {
  return event.summary?.toLowerCase().includes(AVAILABLE_SLOT_SUMMARY);
}

function isBotfolioBooking(event) {
  return event.extendedProperties?.private?.createdBy === BOTFOLIO_MARKER ||
    event.description?.toLowerCase().includes('booked via botfolio');
}

export async function getAvailableSlots({ startDate, endDate }) {
  const calendar = await getCalendarClient();
  const timeMin = toIsoDate(startDate, 'startDate');
  const timeMax = toIsoDate(endDate, 'endDate');
  assertStartBeforeEnd(timeMin, timeMax);

  const res = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin,
    timeMax,
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  });

  const availableSlots = (res.data.items || [])
    .filter(isAvailableSlot)
    .map(event => ({
      start: eventStart(event),
      end: eventEnd(event)
    }));

  if (!availableSlots.length) {
    return { reply: `😕 No available slots found between ${startDate} and ${endDate}.` };
  }

  const formatted = availableSlots
    .map(slot => `- ${slot.start} to ${slot.end}`)
    .join('\n');

  return { reply: `📅 Available slots between ${startDate} and ${endDate}:\n\n${formatted}` };
}

export async function bookSlot({ start, end, name, email }) {
  const calendar = await getCalendarClient();
  const timeMin = toIsoDate(start, 'start');
  const timeMax = toIsoDate(end, 'end');
  assertStartBeforeEnd(timeMin, timeMax);

  const existingEvents = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime'
  });

  const availableSlot = (existingEvents.data.items || []).find(event =>
    isAvailableSlot(event) &&
    new Date(eventStart(event)).getTime() === new Date(timeMin).getTime() &&
    new Date(eventEnd(event)).getTime() === new Date(timeMax).getTime()
  );

  if (!availableSlot) {
    return { reply: `❌ No available slot found between ${start} and ${end}. Please choose another time.` };
  }

  const res = await calendar.events.update({
    calendarId: CALENDAR_ID,
    eventId: availableSlot.id,
    resource: {
      summary: `Portfolio Chat with ${name}`,
      description: `Booked via Botfolio. Contact: ${email}`,
      start: { dateTime: timeMin },
      end: { dateTime: timeMax },
      reminders: { useDefault: true },
      extendedProperties: {
        private: {
          createdBy: BOTFOLIO_MARKER,
          bookingEmail: email
        }
      }
    }
  });

  return {
    reply: `✅ Booking confirmed for ${name} on ${start}.`,
    booking: {
      providerEventId: res.data.id,
      start: timeMin,
      end: timeMax,
      name,
      email
    }
  };
}

export async function cancelBooking({ bookingId, start, end, email }) {
  const calendar = await getCalendarClient();
  const timeMin = toIsoDate(start, 'start');
  const timeMax = toIsoDate(end, 'end');
  assertStartBeforeEnd(timeMin, timeMax);

  const existing = await calendar.events.get({
    calendarId: CALENDAR_ID,
    eventId: bookingId
  });

  const event = existing.data;
  if (!isBotfolioBooking(event)) {
    return { reply: '⚠️ I can only cancel bookings created by Botfolio.' };
  }

  if (email && event.extendedProperties?.private?.bookingEmail !== email) {
    return { reply: `⚠️ I could not verify this booking belongs to ${email}.` };
  }

  await calendar.events.update({
    calendarId: CALENDAR_ID,
    eventId: bookingId,
    resource: {
      summary: 'Available Slot',
      description: 'This time slot is now open.',
      attendees: [],
      reminders: { useDefault: false },
      start: { dateTime: timeMin },
      end: { dateTime: timeMax },
      extendedProperties: {
        private: {
          createdBy: BOTFOLIO_MARKER,
          available: 'true'
        }
      }
    }
  });

  return { reply: '🗑️ Booking has been cancelled.' };
}

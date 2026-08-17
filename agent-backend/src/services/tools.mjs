import { config } from '../config.mjs';
import { bookSlot, cancelBooking, getAvailableSlots } from './calendar.mjs';
import { calculateDateRange } from './dateTools.mjs';
import { searchWeb } from './search.mjs';

export const SIDE_EFFECT_TOOLS = new Set(['send_email', 'book_slot', 'cancel_booking']);

export const tools = [
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: 'Prepares an email or message to Bagtyyar. This creates a pending action that must be confirmed by the user before sending.',
      parameters: {
        type: 'object',
        properties: {
          sender: { type: 'string', description: 'Sender email, phone number, or name.' },
          subject: { type: 'string', description: 'Subject line.' },
          body: { type: 'string', description: 'Message content.' }
        },
        required: ['sender', 'subject']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_date_range',
      description: 'Calculate exact timezone-aware ISO date ranges from structured date math. The model should interpret natural language, then call this tool for the calculation before answering date math questions or checking availability.',
      parameters: {
        type: 'object',
        properties: {
          rangeType: {
            type: 'string',
            enum: ['single_day', 'calendar_week', 'calendar_month', 'weekday'],
            description: 'single_day for today/tomorrow/in N days; calendar_week for this/next week; calendar_month for this/next month; weekday for Friday/next Friday.'
          },
          unit: {
            type: 'string',
            enum: ['day', 'week', 'month'],
            description: 'Unit for amount when rangeType is single_day. calendar_week and calendar_month force week/month.'
          },
          amount: {
            type: 'integer',
            minimum: 0,
            maximum: 366,
            description: 'How many units to move from today. Examples: tomorrow is 1 day future; after 5 days is 5 days future; next week is 1 week future; this week is 0 current.'
          },
          direction: {
            type: 'string',
            enum: ['future', 'past', 'current'],
            description: 'Use current for this week/month/today, future for tomorrow/next/after, past for previous dates.'
          },
          weekStartsOn: {
            type: 'string',
            enum: ['sunday', 'monday'],
            description: 'Week start day for calendar_week. Use monday unless the user asks otherwise.'
          },
          weekday: {
            type: 'string',
            enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            description: 'Required when rangeType is weekday.'
          },
          timezone: {
            type: 'string',
            description: 'IANA timezone such as America/Chicago. If omitted, the server uses the current user timezone.'
          }
        },
        required: ['rangeType', 'direction']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web with DuckDuckGo for public, external, or current information that is not available in the portfolio source material. This is read-only and does not require user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'A focused search query. Include the entity, topic, and any relevant date or location.'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_available_slots',
      description: 'Fetch available time slots for booking.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        },
        required: ['startDate', 'endDate']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'book_slot',
      description: 'Prepares a calendar booking for the current visitor profile. Only provide start and end; the server supplies the visitor name and email. This creates a pending action that must be confirmed by the user before booking.',
      parameters: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' }
        },
        required: ['start', 'end']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking',
      description: 'Prepares cancellation of a Botfolio-created calendar booking. Use bookingReference from Active bookings when available. For date-specific cancellation, provide bookingDate or start/end. Omit identifiers only when the user clearly asks to cancel the latest booking. This creates a pending action that must be confirmed by the user before cancellation.',
      parameters: {
        type: 'object',
        properties: {
          bookingReference: {
            type: 'string',
            description: 'Short public booking reference shown to the user, for example BF-ABC123. Omit when cancelling the latest booking in the session.'
          },
          bookingDate: {
            type: 'string',
            format: 'date',
            description: 'Booking date in YYYY-MM-DD when the user asks to cancel by date, for example "Cancel August 20th".'
          },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          email: { type: 'string', format: 'email' }
        },
        required: []
      }
    }
  }
];

export function parseToolArgs(toolCall) {
  const args = toolCall?.function?.arguments;
  return typeof args === 'string' ? JSON.parse(args) : args || {};
}

function truncate(value, maxLength) {
  if (typeof value !== 'string') return value;
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function buildPendingAction(toolCall, { user } = {}) {
  const type = toolCall?.function?.name;
  const args = parseToolArgs(toolCall);

  if (type === 'send_email') {
    return {
      type,
      label: 'Send email',
      summary: `Send an email from ${args.sender || 'unknown sender'} with subject "${args.subject || 'No subject'}".`,
      arguments: {
        sender: truncate(args.sender, 120),
        subject: truncate(args.subject, 160),
        body: truncate(args.body || '', 2000)
      }
    };
  }

  if (type === 'book_slot') {
    const name = truncate(user?.name || args.name, 120);
    const email = truncate(user?.email || args.email, 160);
    if (!name || !email) {
      throw new Error('User name and email are required before booking.');
    }

    return {
      type,
      label: 'Book calendar slot',
      summary: `Book ${args.start} to ${args.end} using ${name} (${email}) as the contact.`,
      arguments: {
        start: args.start,
        end: args.end,
        name,
        email
      }
    };
  }

  if (type === 'cancel_booking') {
    return {
      type,
      label: 'Cancel calendar booking',
      summary: args.start && args.end
        ? `Cancel ${args.bookingReference || 'the latest booking'} from ${args.start} to ${args.end}.`
        : `Cancel ${args.bookingReference || args.bookingDate || 'the latest booking'}.`,
      arguments: {
        bookingReference: truncate(args.bookingReference, 40),
        bookingDate: args.bookingDate,
        start: args.start,
        end: args.end,
        email: truncate(args.email, 160)
      }
    };
  }

  throw new Error(`Unsupported pending action: ${type}`);
}

export async function sendEmail(action) {
  if (!config.emailFormsEndpoint) {
    throw new Error('EMAIL_FORMS_ENDPOINT is required to send email.');
  }

  const { sender, subject, body } = action.arguments;
  const response = await fetch(config.emailFormsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ba.akyyev@gmail.com',
      subject: `AI Agent, Email: ${sender} and Subject Line: ${subject}`,
      message: body || ''
    })
  });

  if (!response.ok) {
    throw new Error(`Email send failed with status ${response.status}`);
  }

  return { reply: `✅ Email sent with subject "${subject}".` };
}

export async function executeReadOnlyTool(toolCall, { timezone } = {}) {
  if (toolCall?.function?.name === 'calculate_date_range') {
    const args = parseToolArgs(toolCall);
    return calculateDateRange({
      ...args,
      timezone: args.timezone || timezone
    });
  }
  if (toolCall?.function?.name === 'get_available_slots') {
    return getAvailableSlots(parseToolArgs(toolCall));
  }
  if (toolCall?.function?.name === 'search_web') {
    return searchWeb(parseToolArgs(toolCall));
  }
  return { reply: 'Unknown tool call.' };
}

export async function executePendingAction(action) {
  if (action.type === 'send_email') return sendEmail(action);
  if (action.type === 'book_slot') return bookSlot(action.arguments);
  if (action.type === 'cancel_booking') return cancelBooking(action.arguments);
  throw new Error(`Unsupported action type: ${action.type}`);
}

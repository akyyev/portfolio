import { config } from '../config.mjs';
import { bookSlot, cancelBooking, getAvailableSlots } from './calendar.mjs';

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
      description: 'Prepares a calendar booking. This creates a pending action that must be confirmed by the user before booking.',
      parameters: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' }
        },
        required: ['start', 'end', 'name', 'email']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking',
      description: 'Prepares cancellation of a Botfolio-created calendar booking. This creates a pending action that must be confirmed by the user before cancellation.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string' },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          email: { type: 'string', format: 'email' }
        },
        required: ['bookingId', 'start', 'end']
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

export function buildPendingAction(toolCall) {
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
    return {
      type,
      label: 'Book calendar slot',
      summary: `Book ${args.start} to ${args.end} for ${args.name} (${args.email}).`,
      arguments: {
        start: args.start,
        end: args.end,
        name: truncate(args.name, 120),
        email: truncate(args.email, 160)
      }
    };
  }

  if (type === 'cancel_booking') {
    return {
      type,
      label: 'Cancel calendar booking',
      summary: `Cancel booking ${args.bookingId} from ${args.start} to ${args.end}.`,
      arguments: {
        bookingId: truncate(args.bookingId, 200),
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

export async function executeReadOnlyTool(toolCall) {
  if (toolCall?.function?.name === 'get_available_slots') {
    return getAvailableSlots(parseToolArgs(toolCall));
  }
  return { reply: 'Unknown tool call.' };
}

export async function executePendingAction(action) {
  if (action.type === 'send_email') return sendEmail(action);
  if (action.type === 'book_slot') return bookSlot(action.arguments);
  if (action.type === 'cancel_booking') return cancelBooking(action.arguments);
  throw new Error(`Unsupported action type: ${action.type}`);
}

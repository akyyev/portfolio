import crypto from 'node:crypto';
import { config } from '../config.mjs';
import { store } from './redisStore.mjs';

const sessionKey = sessionId => `botfolio:session:${sessionId}`;
const pendingKey = actionId => `botfolio:pending:${actionId}`;
const pendingLockKey = actionId => `botfolio:pending-lock:${actionId}`;

function safeJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createSessionId() {
  return crypto.randomUUID();
}

export async function getSession(sessionId) {
  const id = sessionId || createSessionId();
  const existing = safeJson(await store.get(sessionKey(id)));
  if (existing) return existing;

  return {
    sessionId: id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: null,
    summary: '',
    messages: [],
    bookings: [],
    pendingActionId: null
  };
}

export async function saveSession(session) {
  const next = {
    ...session,
    updatedAt: new Date().toISOString(),
    messages: (session.messages || []).slice(-config.maxStoredMessages),
    bookings: (session.bookings || []).slice(-10)
  };
  await store.setJson(sessionKey(next.sessionId), next, config.sessionTtlSeconds);
  return next;
}

export async function appendMessage(session, message) {
  const content = String(message.content || '').slice(0, config.maxMessageLength);
  const messages = [
    ...(session.messages || []),
    {
      role: message.role,
      content,
      createdAt: new Date().toISOString()
    }
  ].slice(-config.maxStoredMessages);

  return saveSession({ ...session, messages });
}

export async function savePendingAction(session, pendingAction) {
  const actionId = crypto.randomUUID();
  const action = {
    ...pendingAction,
    actionId,
    sessionId: session.sessionId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + config.pendingActionTtlSeconds * 1000).toISOString()
  };

  await store.setJson(pendingKey(actionId), action, config.pendingActionTtlSeconds);
  await saveSession({ ...session, pendingActionId: actionId });
  return action;
}

export async function getPendingAction(actionId) {
  return safeJson(await store.get(pendingKey(actionId)));
}

export async function claimPendingAction(actionId, sessionId) {
  const action = await getPendingAction(actionId);
  if (!action || action.sessionId !== sessionId) {
    return { action: null, claimed: false };
  }

  const claimed = await store.setIfAbsent(
    pendingLockKey(actionId),
    sessionId,
    config.pendingActionTtlSeconds
  );

  return { action, claimed };
}

export async function deletePendingAction(actionId) {
  await store.delete(pendingKey(actionId));
  try {
    await store.delete(pendingLockKey(actionId));
  } catch (error) {
    console.warn('Failed to delete pending action lock:', error.message);
  }
}

export async function releasePendingActionClaim(actionId) {
  await store.delete(pendingLockKey(actionId));
}

export async function addBooking(session, booking) {
  return saveSession({
    ...session,
    bookings: [
      ...(session.bookings || []),
      {
        ...booking,
        createdAt: new Date().toISOString(),
        status: 'booked'
      }
    ]
  });
}

function datePart(value) {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

export function activeBookings(session) {
  return (session.bookings || []).filter(booking => booking.status === 'booked');
}

export function findBooking(session, { reference, start, end, bookingDate } = {}) {
  const bookings = activeBookings(session);
  if (reference) {
    return bookings.find(booking =>
      booking.reference?.toLowerCase() === String(reference).toLowerCase()
    );
  }

  if (start || bookingDate) {
    const targetDate = datePart(start || bookingDate);
    const targetStart = start ? new Date(start).getTime() : null;
    const targetEnd = end ? new Date(end).getTime() : null;

    return bookings.find(booking => {
      const bookingStart = new Date(booking.start).getTime();
      const bookingEnd = new Date(booking.end).getTime();
      if (targetStart && bookingStart !== targetStart) return false;
      if (targetEnd && bookingEnd !== targetEnd) return false;
      return targetDate ? datePart(booking.start) === targetDate : true;
    });
  }

  return [...bookings].reverse()[0];
}

export async function markBookingCancelled(session, reference) {
  return saveSession({
    ...session,
    bookings: (session.bookings || []).map(booking =>
      booking.reference === reference
        ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
        : booking
    )
  });
}

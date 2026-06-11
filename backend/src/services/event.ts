import { eventModel } from "../models/event";
import type { EventCreateData, EventWithRegistration } from "../types/event";

export const eventService = {
  getUpcoming: async (userId: number): Promise<EventWithRegistration[]> => {
    const events = await eventModel.findUpcoming();
    const registrations = await eventModel.findUserRegistrations(userId, events.map(e => e.id));
    const registeredIds = new Set(registrations.map(r => r.eventId));
    return events.map(({ _count, ...e }) => ({
      ...e,
      registeredCount: _count.manta,
      isRegistered: registeredIds.has(e.id),
    }));
  },

  register: async (userId: number, eventId: number) => {
    const existing = await eventModel.findRegistration(userId, eventId);
    if (!existing) await eventModel.register(userId, eventId);
  },

  unregister: (userId: number, eventId: number) =>
    eventModel.unregister(userId, eventId),

  create: (data: EventCreateData) =>
    eventModel.create(data),
};
